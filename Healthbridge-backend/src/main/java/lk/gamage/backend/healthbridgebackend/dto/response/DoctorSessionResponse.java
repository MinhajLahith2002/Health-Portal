package lk.gamage.backend.healthbridgebackend.dto.response;

import java.time.LocalDate;
import java.time.LocalTime;
import lk.gamage.backend.healthbridgebackend.enums.SessionStatus;

public record DoctorSessionResponse(
        String sessionId, String doctorId, String doctorName,
        String specializationId, String specialization,
        String hospitalId, String hospitalName,
        LocalDate sessionDate, String dayOfWeek, LocalTime startTime, LocalTime endTime,
        int maxAppointments, int activeAppointments, int remainingAppointments,
        int lastIssuedAppointmentNumber, int currentQueueNumber,
        SessionStatus status, String notes, String appointmentType) { }
