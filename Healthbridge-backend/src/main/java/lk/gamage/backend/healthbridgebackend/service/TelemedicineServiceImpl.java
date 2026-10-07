package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.*;
import lk.gamage.backend.healthbridgebackend.model.*;
import lk.gamage.backend.healthbridgebackend.repository.ConsultationSessionRepository;
import lk.gamage.backend.healthbridgebackend.repository.TelemedicineSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TelemedicineServiceImpl implements TelemedicineService {

    private static final String ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final TelemedicineSessionRepository sessionRepository;
    private final ConsultationSessionRepository consultationSessionRepository;
    private final AiSummaryGenerator aiSummaryGenerator;

    @Value("${app.telemedicine.signaling-base-url:/ws/telemedicine}")
    private String signalingBaseUrl;

    @Override
    @Transactional
    public SessionResponse createSession(CreateSessionRequest request) {
        // Patient and doctor can both press "Join" - return the existing room instead of creating a second one.
        java.util.Optional<TelemedicineSession> existing = sessionRepository.findFirstByAppointmentId(request.getAppointmentId());
        if (existing.isPresent()) {
            return toResponse(existing.get());
        }

        TelemedicineSession session = TelemedicineSession.builder()
                .appointmentId(request.getAppointmentId())
                .patientId(request.getPatientId())
                .doctorId(request.getDoctorId())
                .roomCode(generateUniqueRoomCode())
                .consultationType(request.getConsultationType())
                .status(SessionStatus.SCHEDULED)
                .scheduledStartTime(request.getScheduledStartTime())
                .recordingEnabled(request.isRecordingEnabled())
                .screenSharingUsed(false)
                .build();

        TelemedicineSession saved = sessionRepository.save(session);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public SessionResponse enterWaitingRoom(String sessionId, JoinSessionRequest request) {
        TelemedicineSession session = getOrThrow(sessionId);

        if (session.getStatus() == SessionStatus.COMPLETED || session.getStatus() == SessionStatus.CANCELLED) {
            throw new InvalidSessionStateException("Cannot enter waiting room: session is " + session.getStatus());
        }

        if (session.getStatus() == SessionStatus.SCHEDULED) {
            session.setStatus(SessionStatus.WAITING_ROOM);
        }

        recordJoinTimestamp(session, request);
        return toResponse(sessionRepository.save(session));
    }

    @Override
    @Transactional
    public SessionResponse joinSession(String sessionId, JoinSessionRequest request) {
        TelemedicineSession session = getOrThrow(sessionId);

        if (session.getStatus() == SessionStatus.COMPLETED || session.getStatus() == SessionStatus.CANCELLED) {
            throw new InvalidSessionStateException("Cannot join: session is " + session.getStatus());
        }

        recordJoinTimestamp(session, request);

        boolean bothPresent = session.getPatientJoinedAt() != null && session.getDoctorJoinedAt() != null;
        if (bothPresent && session.getStatus() != SessionStatus.IN_PROGRESS) {
            session.setStatus(SessionStatus.IN_PROGRESS);
            session.setActualStartTime(LocalDateTime.now());
        }

        return toResponse(sessionRepository.save(session));
    }

    @Override
    public SessionResponse getSession(String sessionId) {
        return toResponse(getOrThrow(sessionId));
    }

    @Override
    public SessionResponse getSessionByRoomCode(String roomCode) {
        TelemedicineSession session = sessionRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new TelemedicineSessionNotFoundException(roomCode));
        return toResponse(session);
    }

    @Override
    public SessionResponse getSessionByAppointmentId(String appointmentId) {
        TelemedicineSession session = sessionRepository.findFirstByAppointmentId(appointmentId)
                .orElseThrow(() -> new TelemedicineSessionNotFoundException(appointmentId));
        return toResponse(session);
    }

    @Override
    @Transactional
    public SessionResponse endSession(String sessionId, EndSessionRequest request) {
        TelemedicineSession session = getOrThrow(sessionId);

        if (session.getStatus() == SessionStatus.CANCELLED) {
            throw new InvalidSessionStateException("Cannot end a cancelled session");
        }

        // Both participants hang up -> the second call must not create another ConsultationSession or AI summary.
        if (session.getStatus() == SessionStatus.COMPLETED) {
            return toResponse(session);
        }

        LocalDateTime endTime = LocalDateTime.now();
        session.setStatus(SessionStatus.COMPLETED);
        session.setEndTime(endTime);
        if (request.isScreenSharingUsed()) {
            session.setScreenSharingUsed(true);
        }

        if (session.getActualStartTime() != null) {
            long seconds = Duration.between(session.getActualStartTime(), endTime).getSeconds();
            session.setDurationInSeconds(Math.max(seconds, 0));
        }

        ConsultationSession consultation = ConsultationSession.builder()
                .telemedicineSessionId(session.getId())
                .appointmentId(session.getAppointmentId())
                .patientId(session.getPatientId())
                .doctorId(session.getDoctorId())
                .doctorNotes(request.getDoctorNotes())
                .aiSummaryStatus(request.isRequestAiSummary()
                        ? ConsultationSession.AiSummaryStatus.PENDING
                        : ConsultationSession.AiSummaryStatus.NOT_REQUESTED)
                .followUpRequired(false)
                .build();

        ConsultationSession savedConsultation = consultationSessionRepository.save(consultation);
        session.setConsultationSessionId(savedConsultation.getId());
        TelemedicineSession savedSession = sessionRepository.save(session);

        if (request.isRequestAiSummary()) {
            aiSummaryGenerator.generateSummaryAsync(savedConsultation.getId(), request.getDoctorNotes());
        }

        return toResponse(savedSession);
    }

    @Override
    @Transactional
    public SessionResponse cancelSession(String sessionId, String reason) {
        TelemedicineSession session = getOrThrow(sessionId);

        if (session.getStatus() == SessionStatus.COMPLETED) {
            throw new InvalidSessionStateException("Cannot cancel a completed session");
        }

        session.setStatus(SessionStatus.CANCELLED);
        return toResponse(sessionRepository.save(session));
    }

    @Override
    public ConsultationSummaryResponse getSummary(String sessionId) {
        TelemedicineSession session = getOrThrow(sessionId);

        if (session.getConsultationSessionId() == null) {
            throw new TelemedicineSessionNotFoundException("No summary yet for session " + sessionId);
        }

        ConsultationSession consultation = consultationSessionRepository
                .findById(session.getConsultationSessionId())
                .orElseThrow(() -> new TelemedicineSessionNotFoundException(session.getConsultationSessionId()));

        return ConsultationSummaryResponse.builder()
                .id(consultation.getId())
                .telemedicineSessionId(consultation.getTelemedicineSessionId())
                .doctorNotes(consultation.getDoctorNotes())
                .aiGeneratedSummary(consultation.getAiGeneratedSummary())
                .aiSummaryStatus(consultation.getAiSummaryStatus())
                .keySymptomsDiscussed(consultation.getKeySymptomsDiscussed())
                .followUpActions(consultation.getFollowUpActions())
                .followUpRequired(consultation.isFollowUpRequired())
                .followUpDate(consultation.getFollowUpDate())
                .recordingUrl(consultation.getRecordingMetadata() != null
                        ? consultation.getRecordingMetadata().getStorageUrl()
                        : null)
                .build();
    }

    @Override
    public List<SessionHistoryItem> getHistoryForPatient(String patientId) {
        return sessionRepository.findByPatientIdOrderByScheduledStartTimeDesc(patientId).stream()
                .map(s -> toHistoryItem(s, s.getDoctorId()))
                .collect(Collectors.toList());
    }

    @Override
    public List<SessionHistoryItem> getHistoryForDoctor(String doctorId) {
        return sessionRepository.findByDoctorIdOrderByScheduledStartTimeDesc(doctorId).stream()
                .map(s -> toHistoryItem(s, s.getPatientId()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markScreenSharingUsed(String sessionId) {
        TelemedicineSession session = getOrThrow(sessionId);
        session.setScreenSharingUsed(true);
        sessionRepository.save(session);
    }

    @Override
    @Transactional
    public void attachRecording(String sessionId, RecordingMetadataRequest request) {
        TelemedicineSession session = getOrThrow(sessionId);
        session.setRecordingId(UUID.randomUUID().toString());
        sessionRepository.save(session);

        if (session.getConsultationSessionId() != null) {
            consultationSessionRepository.findById(session.getConsultationSessionId()).ifPresent(consultation -> {
                RecordingMetadata metadata = RecordingMetadata.builder()
                        .storageUrl(request.getStorageUrl())
                        .fileFormat(request.getFileFormat())
                        .fileSizeBytes(request.getFileSizeBytes())
                        .durationInSeconds(request.getDurationInSeconds())
                        .recordedAt(LocalDateTime.now())
                        .consentGivenByPatient(request.isConsentGivenByPatient())
                        .consentGivenByDoctor(request.isConsentGivenByDoctor())
                        .build();
                consultation.setRecordingMetadata(metadata);
                consultationSessionRepository.save(consultation);
            });
        }
    }

    // ---- helpers ----

    private void recordJoinTimestamp(TelemedicineSession session, JoinSessionRequest request) {
        LocalDateTime now = LocalDateTime.now();
        if ("PATIENT".equalsIgnoreCase(request.getRole())) {
            if (session.getPatientJoinedAt() == null) {
                session.setPatientJoinedAt(now);
            }
        } else if ("DOCTOR".equalsIgnoreCase(request.getRole())) {
            if (session.getDoctorJoinedAt() == null) {
                session.setDoctorJoinedAt(now);
            }
        } else {
            throw new IllegalArgumentException("role must be PATIENT or DOCTOR");
        }
    }

    private TelemedicineSession getOrThrow(String sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new TelemedicineSessionNotFoundException(sessionId));
    }

    private String generateUniqueRoomCode() {
        String code;
        do {
            code = generateRoomCode();
        } while (sessionRepository.findByRoomCode(code).isPresent());
        return code;
    }

    private String generateRoomCode() {
        StringBuilder sb = new StringBuilder("HB-");
        for (int i = 0; i < 6; i++) {
            sb.append(ROOM_CODE_CHARS.charAt(RANDOM.nextInt(ROOM_CODE_CHARS.length())));
        }
        return sb.toString();
    }

    private SessionResponse toResponse(TelemedicineSession session) {
        return SessionResponse.builder()
                .id(session.getId())
                .appointmentId(session.getAppointmentId())
                .patientId(session.getPatientId())
                .doctorId(session.getDoctorId())
                .roomCode(session.getRoomCode())
                .consultationType(session.getConsultationType())
                .status(session.getStatus())
                .scheduledStartTime(session.getScheduledStartTime())
                .actualStartTime(session.getActualStartTime())
                .endTime(session.getEndTime())
                .durationInSeconds(session.getDurationInSeconds())
                .recordingEnabled(session.isRecordingEnabled())
                .signalingUrl(signalingBaseUrl + "/" + session.getRoomCode())
                .build();
    }

    private SessionHistoryItem toHistoryItem(TelemedicineSession session, String counterpartId) {
        return SessionHistoryItem.builder()
                .id(session.getId())
                .counterpartId(counterpartId)
                .counterpartName(null) // resolved by the frontend/BFF via user-profile service
                .consultationType(session.getConsultationType())
                .status(session.getStatus())
                .scheduledStartTime(session.getScheduledStartTime())
                .durationInSeconds(session.getDurationInSeconds())
                .hasRecording(session.getRecordingId() != null)
                .hasSummary(session.getConsultationSessionId() != null)
                .build();
    }
}