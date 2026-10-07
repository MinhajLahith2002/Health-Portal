package lk.gamage.backend.healthbridgebackend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import lk.gamage.backend.healthbridgebackend.dto.request.DoctorSessionRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.DoctorSessionResponse;
import lk.gamage.backend.healthbridgebackend.dto.response.PublicDoctorSessionResponse;
import lk.gamage.backend.healthbridgebackend.enums.SessionStatus;
import lk.gamage.backend.healthbridgebackend.exception.BadRequestException;
import lk.gamage.backend.healthbridgebackend.exception.ConflictException;
import lk.gamage.backend.healthbridgebackend.exception.ResourceNotFoundException;
import lk.gamage.backend.healthbridgebackend.model.DoctorSession;
import lk.gamage.backend.healthbridgebackend.model.User;
import lk.gamage.backend.healthbridgebackend.repository.DoctorSessionRepository;
import lk.gamage.backend.healthbridgebackend.repository.AppointmentRepository;
import lk.gamage.backend.healthbridgebackend.repository.UserRepository;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.BasicQuery;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class DoctorSessionService {
    private static final String DEFAULT_APPOINTMENT_TYPE = "IN_PERSON";

    private final DoctorSessionRepository repository;
    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;
    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;

    public DoctorSessionService(DoctorSessionRepository repository, UserRepository userRepository, MongoTemplate mongoTemplate,
                                AppointmentRepository appointmentRepository, NotificationService notificationService) {
        this.repository = repository; this.userRepository = userRepository; this.mongoTemplate = mongoTemplate;
        this.appointmentRepository = appointmentRepository; this.notificationService = notificationService;
    }

    public DoctorSessionResponse create(String doctorId, DoctorSessionRequest r) {
        validateRequest(r); assertDoctor(doctorId);
        assertNoOverlap(doctorId, r.sessionDate(), r.startTime(), r.endTime(), null);
        LocalDateTime now = LocalDateTime.now();
        DoctorSession session = DoctorSession.builder().doctorId(doctorId)
                .hospitalId(r.hospitalId().trim()).hospitalName(r.hospitalName().trim())
                .specializationId(trimToNull(r.specializationId())).specializationName(r.specializationName().trim())
                .sessionDate(r.sessionDate()).startTime(r.startTime()).endTime(r.endTime())
                .maxAppointments(r.maxAppointments()).bookedCount(0).lastIssuedAppointmentNumber(0).currentQueueNumber(0)
                .status(SessionStatus.AVAILABLE).notes(trimToNull(r.notes())).appointmentType(normalizeAppointmentType(r.appointmentType()))
                .createdAt(now).updatedAt(now).build();
        return toResponse(repository.save(session));
    }

    public DoctorSessionResponse update(String doctorId, String id, DoctorSessionRequest r) {
        validateRequest(r);
        DoctorSession session = owned(id, doctorId);
        if (session.getSessionDate().isBefore(LocalDate.now())) throw new BadRequestException("Past sessions cannot be edited.");
        if (r.maxAppointments() < session.getBookedCount()) throw new ConflictException("Maximum appointments cannot be lower than active bookings.");
        if (session.getBookedCount() > 0 && !r.hospitalId().trim().equalsIgnoreCase(session.getHospitalId()))
            throw new ConflictException("A session with active bookings cannot be moved to another hospital branch.");
        assertNoOverlap(doctorId, r.sessionDate(), r.startTime(), r.endTime(), id);
        session.setHospitalId(r.hospitalId().trim()); session.setHospitalName(r.hospitalName().trim());
        session.setSpecializationId(trimToNull(r.specializationId())); session.setSpecializationName(r.specializationName().trim());
        session.setSessionDate(r.sessionDate()); session.setStartTime(r.startTime()); session.setEndTime(r.endTime());
        session.setMaxAppointments(r.maxAppointments()); session.setNotes(trimToNull(r.notes()));
        session.setAppointmentType(normalizeAppointmentType(r.appointmentType()));
        session.setUpdatedAt(LocalDateTime.now());
        if (session.getBookedCount() >= session.getMaxAppointments()) session.setStatus(SessionStatus.FULL);
        else if (session.getStatus() == SessionStatus.FULL) session.setStatus(SessionStatus.AVAILABLE);
        return toResponse(repository.save(session));
    }

    public DoctorSessionResponse setStatus(String doctorId, String id, SessionStatus status) {
        DoctorSession session = owned(id, doctorId);
        if (status == null) throw new BadRequestException("Session status is required.");
        if (status == SessionStatus.FULL) throw new BadRequestException("FULL is managed automatically from capacity.");
        if (session.getSessionDate().isBefore(LocalDate.now())) throw new BadRequestException("Past sessions cannot be changed.");
        session.setStatus(status); session.setUpdatedAt(LocalDateTime.now());
        DoctorSession saved = repository.save(session);
        if (status == SessionStatus.CANCELLED) {
            var activeAppointments = appointmentRepository.findBySessionIdOrderByAppointmentNumberAsc(id).stream()
                    .filter(a -> a.getStatus() != null && a.getStatus().isActive()).toList();
            activeAppointments.forEach(a -> {
                        a.setStatus(lk.gamage.backend.healthbridgebackend.enums.AppointmentStatus.CANCELLED);
                        a.setActiveBookingKey(null); a.setCancellationReason("Doctor session cancelled.");
                        a.setCancelledAt(LocalDateTime.now()); a.setUpdatedAt(a.getCancelledAt());
                        appointmentRepository.save(a);
                        try { notificationService.notifyAppointment(a.getPatientId(), "Doctor session cancelled",
                                "The doctor session on " + session.getSessionDate() + " at " + session.getStartTime() + " has been cancelled.", a.getId()); }
                        catch (RuntimeException ignored) { }
                    });
            if (!activeAppointments.isEmpty()) { saved.setBookedCount(0); saved = repository.save(saved); }
        }
        return toResponse(saved);
    }

    public void delete(String doctorId, String id) {
        DoctorSession session = owned(id, doctorId);
        if (session.getBookedCount() > 0) {
            session.setStatus(SessionStatus.CANCELLED); session.setUpdatedAt(LocalDateTime.now()); repository.save(session);
        } else repository.delete(session);
    }

    public DoctorSessionResponse get(String id) { return toResponse(require(id)); }
    public List<DoctorSessionResponse> mine(String doctorId) {
        assertDoctor(doctorId);
        return repository.findByDoctorIdOrderBySessionDateAscStartTimeAsc(doctorId).stream().map(this::toResponse).toList();
    }

    public List<DoctorSessionResponse> search(String doctorId, String hospitalId, String specialization, LocalDate date) {
        String needle = specialization == null ? null : specialization.trim().toLowerCase(Locale.ROOT);
        return repository.findAll().stream().filter(s -> !s.getSessionDate().isBefore(LocalDate.now()))
                .filter(s -> doctorId == null || doctorId.isBlank() || doctorId.equals(s.getDoctorId())
                        || userRepository.findById(s.getDoctorId()).map(User::getFullName)
                                .map(name -> name.toLowerCase(Locale.ROOT).contains(doctorId.toLowerCase(Locale.ROOT))).orElse(false))
                .filter(s -> hospitalId == null || hospitalId.isBlank()
                        || hospitalId.equalsIgnoreCase(s.getHospitalId())
                        || s.getHospitalName() != null && s.getHospitalName().toLowerCase(Locale.ROOT).contains(hospitalId.toLowerCase(Locale.ROOT)))
                .filter(s -> date == null || date.equals(s.getSessionDate()))
                .filter(s -> needle == null || needle.isBlank() || s.getSpecializationName() != null && s.getSpecializationName().toLowerCase(Locale.ROOT).contains(needle))
                .sorted(Comparator.comparing(DoctorSession::getSessionDate).thenComparing(DoctorSession::getStartTime))
                .map(this::toResponse).toList();
    }

    public DoctorSession reserve(String id) {
        org.bson.Document filter = new org.bson.Document("_id", id).append("status", SessionStatus.AVAILABLE.name())
                .append("sessionDate", new org.bson.Document("$gte", LocalDate.now()))
                .append("$expr", new org.bson.Document("$lt", List.of("$bookedCount", "$maxAppointments")));
        DoctorSession session = mongoTemplate.findAndModify(new BasicQuery(filter),
                new Update().inc("bookedCount", 1).inc("lastIssuedAppointmentNumber", 1).set("updatedAt", LocalDateTime.now()),
                FindAndModifyOptions.options().returnNew(true), DoctorSession.class);
        if (session == null) {
            DoctorSession existing = require(id);
            if (existing.getSessionDate().isBefore(LocalDate.now())) throw new ConflictException("Past sessions cannot accept bookings.");
            if (existing.getStatus() == SessionStatus.HOLIDAY) throw new ConflictException("This session is marked as a holiday.");
            if (existing.getStatus() == SessionStatus.CANCELLED) throw new ConflictException("This session is no longer available.");
            if (existing.getStatus() == SessionStatus.COMPLETED) throw new ConflictException("This session has been completed.");
            throw new ConflictException("Session is full for this day.");
        }
        if (session.getBookedCount() >= session.getMaxAppointments()) {
            mongoTemplate.updateFirst(Query.query(Criteria.where("id").is(id)), new Update().set("status", SessionStatus.FULL), DoctorSession.class);
            session.setStatus(SessionStatus.FULL);
        }
        return session;
    }

    public void release(String id) {
        DoctorSession current = require(id);
        int nextActiveCount = Math.max(0, current.getBookedCount() - 1);
        Update update = new Update().inc("bookedCount", -1).set("lastIssuedAppointmentNumber", nextActiveCount).set("updatedAt", LocalDateTime.now());
        if (current.getStatus() == SessionStatus.FULL) update.set("status", SessionStatus.AVAILABLE);
        mongoTemplate.updateFirst(Query.query(Criteria.where("id").is(id).and("bookedCount").gt(0)), update, DoctorSession.class);
    }

    public DoctorSessionResponse updateQueue(String doctorId, String id, Integer requested, String action) {
        DoctorSession session = owned(id, doctorId);
        int next = requested == null ? session.getCurrentQueueNumber() : requested;
        if (action != null) {
            if ("start".equalsIgnoreCase(action)) next = session.getLastIssuedAppointmentNumber() == 0 ? 0 : 1;
            else if ("next".equalsIgnoreCase(action)) next++;
            else if ("previous".equalsIgnoreCase(action)) next--;
        }
        if (next < 0 || next > session.getLastIssuedAppointmentNumber())
            throw new BadRequestException("Current queue number must be between 0 and the last issued appointment number.");
        session.setCurrentQueueNumber(next); session.setUpdatedAt(LocalDateTime.now());
        return toResponse(repository.save(session));
    }

    public DoctorSession require(String id) { return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Doctor session not found: " + id)); }
    public DoctorSession owned(String id, String doctorId) {
        DoctorSession session = require(id);
        if (!session.getDoctorId().equals(doctorId)) throw new AccessDeniedException("You may only manage your own sessions.");
        return session;
    }

    public DoctorSessionResponse toResponse(DoctorSession s) {
        String doctorName = userRepository.findById(s.getDoctorId()).map(User::getFullName).orElse("Doctor");
        SessionStatus effective = s.getSessionDate().isBefore(LocalDate.now()) ? SessionStatus.COMPLETED : s.getStatus();
        // Branch information is supplied by Hospital Management and stored on the session.
        // Do not invent a default hospital for legacy records that have no branch assigned.
        String hospitalId = s.getHospitalId();
        String hospitalName = s.getHospitalName();
        return new DoctorSessionResponse(s.getId(), s.getDoctorId(), doctorName, s.getSpecializationId(), s.getSpecializationName(),
                hospitalId, hospitalName, s.getSessionDate(), s.getSessionDate().getDayOfWeek().toString(),
                s.getStartTime(), s.getEndTime(), s.getMaxAppointments(), s.getBookedCount(),
                Math.max(s.getMaxAppointments() - s.getBookedCount(), 0), s.getLastIssuedAppointmentNumber(),
                s.getCurrentQueueNumber(), effective, s.getNotes(), normalizeAppointmentType(s.getAppointmentType()));
    }

    public PublicDoctorSessionResponse toPublicResponse(DoctorSession s) {
        String doctorName = userRepository.findById(s.getDoctorId()).map(User::getFullName).orElse("Doctor");
        SessionStatus effective = s.getSessionDate().isBefore(LocalDate.now()) ? SessionStatus.COMPLETED : s.getStatus();
        return new PublicDoctorSessionResponse(s.getId(), s.getDoctorId(), doctorName,
                s.getSpecializationName(), s.getHospitalName(), s.getSessionDate(),
                s.getSessionDate().getDayOfWeek().toString(), s.getStartTime(), s.getEndTime(),
                Math.max(s.getMaxAppointments() - s.getBookedCount(), 0), effective,
                normalizeAppointmentType(s.getAppointmentType()));
    }

    private void validateRequest(DoctorSessionRequest r) {
        if (r == null) throw new BadRequestException("Session details are required.");
        if (r.hospitalId() == null || r.hospitalId().isBlank()) throw new BadRequestException("Hospital branch is required.");
        if (r.hospitalName() == null || r.hospitalName().isBlank()) throw new BadRequestException("Hospital branch name is required.");
        if (r.maxAppointments() <= 0) throw new BadRequestException("Maximum appointments must be greater than zero.");
        if (r.sessionDate() != null && r.sessionDate().isBefore(LocalDate.now())) throw new BadRequestException("Session date cannot be in the past.");
        if (r.endTime() != null && !r.endTime().isAfter(r.startTime())) throw new BadRequestException("End time must be after start time.");
        if (r.appointmentType() != null && !r.appointmentType().isBlank()
                && !"VIDEO".equalsIgnoreCase(r.appointmentType()) && !"IN_PERSON".equalsIgnoreCase(r.appointmentType()))
            throw new BadRequestException("appointmentType must be either VIDEO or IN_PERSON.");
    }
    private void assertNoOverlap(String doctorId, LocalDate date, LocalTime start, LocalTime end, String ignoredId) {
        LocalTime requestedEnd = end == null ? start.plusMinutes(1) : end;
        boolean overlaps = repository.findByDoctorIdAndSessionDate(doctorId, date).stream()
                .filter(s -> ignoredId == null || !ignoredId.equals(s.getId())).filter(s -> s.getStatus() != SessionStatus.CANCELLED)
                .anyMatch(s -> { LocalTime existingEnd = s.getEndTime() == null ? s.getStartTime().plusMinutes(1) : s.getEndTime(); return start.isBefore(existingEnd) && s.getStartTime().isBefore(requestedEnd); });
        if (overlaps) throw new ConflictException("This session overlaps another session for the doctor.");
    }
    private void assertDoctor(String id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + id));
        if (!"DOCTOR".equalsIgnoreCase(user.getRole())) throw new AccessDeniedException("Only doctors can manage sessions.");
    }
    private String trimToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    /** Normalizes to "VIDEO" or "IN_PERSON", defaulting older/blank values to IN_PERSON. */
    private String normalizeAppointmentType(String value) {
        if (value == null || value.isBlank()) return DEFAULT_APPOINTMENT_TYPE;
        String normalized = value.trim();
        return "VIDEO".equalsIgnoreCase(normalized) ? "VIDEO" : DEFAULT_APPOINTMENT_TYPE;
    }
}
