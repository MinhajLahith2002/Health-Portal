package lk.gamage.backend.healthbridgebackend.service.impl;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lk.gamage.backend.healthbridgebackend.dto.request.AppointmentBookingRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.AppointmentBookingResponse;
import lk.gamage.backend.healthbridgebackend.enums.AppointmentStatus;
import lk.gamage.backend.healthbridgebackend.exception.BadRequestException;
import lk.gamage.backend.healthbridgebackend.exception.ConflictException;
import lk.gamage.backend.healthbridgebackend.exception.ResourceNotFoundException;
import lk.gamage.backend.healthbridgebackend.model.Appointment;
import lk.gamage.backend.healthbridgebackend.model.DoctorSession;
import lk.gamage.backend.healthbridgebackend.model.User;
import lk.gamage.backend.healthbridgebackend.repository.AppointmentRepository;
import lk.gamage.backend.healthbridgebackend.repository.UserRepository;
import lk.gamage.backend.healthbridgebackend.service.AppointmentService;
import lk.gamage.backend.healthbridgebackend.service.DoctorSessionService;
import lk.gamage.backend.healthbridgebackend.service.NotificationService;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class AppointmentServiceImpl implements AppointmentService {
    private static final List<AppointmentStatus> ACTIVE = List.of(AppointmentStatus.BOOKED, AppointmentStatus.UPCOMING);
    private final AppointmentRepository repository;
    private final UserRepository userRepository;
    private final DoctorSessionService sessionService;
    private final NotificationService notificationService;

    public AppointmentServiceImpl(AppointmentRepository repository, UserRepository userRepository, DoctorSessionService sessionService,
                                  NotificationService notificationService) {
        this.repository = repository; this.userRepository = userRepository; this.sessionService = sessionService;
        this.notificationService = notificationService;
    }

    @Override public AppointmentBookingResponse book(String patientId, AppointmentBookingRequest r) {
        requirePatient(patientId);
        if (repository.existsBySessionIdAndPatientIdAndStatusIn(r.sessionId(), patientId, ACTIVE))
            throw new ConflictException("You already have an appointment for this session.");
        DoctorSession reserved = sessionService.reserve(r.sessionId());
        Appointment a = new Appointment();
        a.setPatientId(patientId); a.setSessionId(reserved.getId()); a.setDoctorId(reserved.getDoctorId());
        a.setHospitalId(reserved.getHospitalId()); a.setHospital(reserved.getHospitalName());
        a.setDoctorName(userRepository.findById(reserved.getDoctorId()).map(User::getFullName).orElse("Doctor"));
        a.setDoctorSpecialization(reserved.getSpecializationName());
        a.setAppointmentDate(reserved.getSessionDate()); a.setAppointmentTime(reserved.getStartTime().toString());
        a.setAppointmentType(reserved.getAppointmentType() != null ? reserved.getAppointmentType() : "IN_PERSON");
        a.setStatus(AppointmentStatus.BOOKED);
        a.setAppointmentNumber(reserved.getLastIssuedAppointmentNumber());
        a.setReferenceNumber(reference(reserved)); a.setActiveBookingKey(reserved.getId() + ":" + patientId);
        a.setPatientName(r.patientName().trim()); a.setPatientPhone(r.patientPhone().trim());
        a.setPatientNicOrPassport(r.nicOrPassport().trim()); a.setPatientEmail(blankToNull(r.email()));
        a.setPatientAddress(blankToNull(r.address())); a.setCreatedAt(LocalDateTime.now()); a.setUpdatedAt(a.getCreatedAt());
        try {
            Appointment saved = repository.save(a);
            notifySafely(patientId, "Appointment confirmed",
                    "Your appointment " + saved.getReferenceNumber() + " is confirmed with number " + saved.getAppointmentNumber() + ".", saved.getId());
            return toResponse(saved, reserved);
        }
        catch (DuplicateKeyException ex) { sessionService.release(reserved.getId()); throw new ConflictException("You already have an appointment for this session."); }
        catch (RuntimeException ex) { sessionService.release(reserved.getId()); throw ex; }
    }

    @Override public List<AppointmentBookingResponse> findMine(String patientId) {
        requirePatient(patientId);
        return repository.findByPatientIdOrderByAppointmentDateDescAppointmentTimeDesc(patientId).stream().map(this::toResponse).toList();
    }

    @Override public AppointmentBookingResponse findOwned(String id, String userId, String role) {
        Appointment a = raw(id);
        if ("PATIENT".equalsIgnoreCase(role) && !userId.equals(a.getPatientId())) throw new AccessDeniedException("You may only view your own appointments.");
        if ("DOCTOR".equalsIgnoreCase(role) && !userId.equals(a.getDoctorId())) throw new AccessDeniedException("You may only view appointments for your sessions.");
        if (!"PATIENT".equalsIgnoreCase(role) && !"DOCTOR".equalsIgnoreCase(role) && !role.toUpperCase(Locale.ROOT).contains("ADMIN")) throw new AccessDeniedException("Appointment access is not permitted.");
        return toResponse(a);
    }

    @Override public AppointmentBookingResponse cancel(String id, String patientId, String reason) {
        Appointment a = raw(id);
        if (!patientId.equals(a.getPatientId())) throw new AccessDeniedException("You may only cancel your own appointments.");
        if (!a.getStatus().isActive()) throw new ConflictException("Only active appointments can be cancelled.");
        LocalTime appointmentTime = parseTime(a.getAppointmentTime());
        if (a.getAppointmentDate() == null || appointmentTime == null)
            throw new ConflictException("The appointment date or time is unavailable. Please contact the hospital.");
        LocalDateTime appointmentDateTime = LocalDateTime.of(a.getAppointmentDate(), appointmentTime);
        if (appointmentDateTime.isBefore(LocalDateTime.now().plusHours(24)))
            throw new ConflictException("Appointments can only be cancelled at least 24 hours before the session starts.");
        a.setStatus(AppointmentStatus.CANCELLED); a.setActiveBookingKey(null);
        a.setCancellationReason(reason == null || reason.isBlank() ? "Cancelled by patient." : reason.trim());
        a.setCancelledAt(LocalDateTime.now()); a.setUpdatedAt(a.getCancelledAt());
        Appointment saved = repository.save(a);
        if (a.getSessionId() != null) sessionService.release(a.getSessionId());
        notifySafely(patientId, "Appointment cancelled",
                "Your appointment " + a.getReferenceNumber() + " has been cancelled.", a.getId());
        return toResponse(saved);
    }

    @Override public AppointmentBookingResponse reschedule(String id, String patientId, String targetSessionId) {
        Appointment a = raw(id);
        if (!patientId.equals(a.getPatientId())) throw new AccessDeniedException("You may only reschedule your own appointments.");
        if (!a.getStatus().isActive()) throw new ConflictException("Only active appointments can be rescheduled.");
        if (targetSessionId.equals(a.getSessionId())) throw new BadRequestException("Choose a different session.");
        if (repository.existsBySessionIdAndPatientIdAndStatusIn(targetSessionId, patientId, ACTIVE)) throw new ConflictException("You already have an appointment for the target session.");
        DoctorSession target = sessionService.reserve(targetSessionId);
        String oldSessionId = a.getSessionId();
        a.setSessionId(target.getId()); a.setDoctorId(target.getDoctorId()); a.setHospitalId(target.getHospitalId());
        a.setHospital(target.getHospitalName()); a.setDoctorSpecialization(target.getSpecializationName());
        a.setDoctorName(userRepository.findById(target.getDoctorId()).map(User::getFullName).orElse("Doctor"));
        a.setAppointmentDate(target.getSessionDate()); a.setAppointmentTime(target.getStartTime().toString());
        a.setAppointmentType(target.getAppointmentType() != null ? target.getAppointmentType() : "IN_PERSON");
        a.setAppointmentNumber(target.getLastIssuedAppointmentNumber()); a.setActiveBookingKey(target.getId() + ":" + patientId);
        a.setUpdatedAt(LocalDateTime.now());
        try {
            Appointment saved = repository.save(a);
            if (oldSessionId != null) sessionService.release(oldSessionId);
            notifySafely(patientId, "Appointment rescheduled",
                    "Your appointment " + a.getReferenceNumber() + " has been moved to " + a.getAppointmentDate() + " at " + a.getAppointmentTime() + ".", a.getId());
            return toResponse(saved, target);
        } catch (RuntimeException ex) { sessionService.release(target.getId()); throw ex; }
    }

    @Override public List<AppointmentBookingResponse> queue(String sessionId, String doctorId) {
        sessionService.owned(sessionId, doctorId);
        return repository.findBySessionIdOrderByAppointmentNumberAsc(sessionId).stream().map(this::toResponse).toList();
    }

    @Override public AppointmentBookingResponse updateQueueAppointment(String id, String doctorId, String status) {
        Appointment a = raw(id);
        if (!doctorId.equals(a.getDoctorId())) throw new AccessDeniedException("You may only manage appointments for your sessions.");
        AppointmentStatus next;
        try { next = AppointmentStatus.valueOf(status.toUpperCase(Locale.ROOT)); }
        catch (Exception ex) { throw new BadRequestException("Status must be COMPLETED or NO_SHOW."); }
        if (next != AppointmentStatus.COMPLETED && next != AppointmentStatus.NO_SHOW) throw new BadRequestException("Status must be COMPLETED or NO_SHOW.");
        if (!a.getStatus().isActive()) throw new ConflictException("Only active appointments can be updated.");
        a.setStatus(next); a.setActiveBookingKey(null); a.setUpdatedAt(LocalDateTime.now());
        return toResponse(repository.save(a));
    }

    @Override public Appointment raw(String id) { return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id)); }
    private AppointmentBookingResponse toResponse(Appointment a) {
        DoctorSession session = a.getSessionId() == null ? null : sessionService.require(a.getSessionId());
        return toResponse(a, session);
    }
    private AppointmentBookingResponse toResponse(Appointment a, DoctorSession s) {
        return new AppointmentBookingResponse(a.getId(), a.getReferenceNumber(), a.getAppointmentNumber() == null ? 0 : a.getAppointmentNumber(),
                a.getSessionId(), a.getPatientId(), a.getPatientName(), a.getDoctorId(), a.getDoctorName(), a.getHospitalId(), a.getHospital(),
                a.getDoctorSpecialization(), a.getAppointmentDate(), s == null ? parseTime(a.getAppointmentTime()) : s.getStartTime(),
                s == null ? 0 : s.getCurrentQueueNumber(), a.getStatus(), a.getPatientPhone(), a.getPatientNicOrPassport(),
                a.getPatientEmail(), a.getPatientAddress(), a.getCancellationReason(),
                resolveAppointmentType(a, s));
    }
    /** Appointment's own type wins; falls back to the session's type, then IN_PERSON (covers older records). */
    private String resolveAppointmentType(Appointment a, DoctorSession s) {
        String type = a.getAppointmentType();
        if (type == null || type.isBlank()) type = s != null ? s.getAppointmentType() : null;
        return "VIDEO".equalsIgnoreCase(type) ? "VIDEO" : "IN_PERSON";
    }
    private User requirePatient(String id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + id));
        if (!"PATIENT".equalsIgnoreCase(user.getRole())) throw new AccessDeniedException("Only patients can book appointments.");
        return user;
    }
    private String reference(DoctorSession s) { return "HB-" + s.getSessionDate().format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase(Locale.ROOT); }
    private void notifySafely(String recipientId, String title, String message, String appointmentId) {
        try { notificationService.notifyAppointment(recipientId, title, message, appointmentId); }
        catch (RuntimeException ignored) { /* Notification delivery must not invalidate a completed booking mutation. */ }
    }
    private String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private LocalTime parseTime(String value) { try { return value == null ? null : LocalTime.parse(value); } catch (Exception ex) { return null; } }
}