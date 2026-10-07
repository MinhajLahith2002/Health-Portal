package lk.gamage.backend.healthbridgebackend.dto.response;

import java.time.LocalDate;
import java.time.LocalTime;
import lk.gamage.backend.healthbridgebackend.enums.SessionStatus;

/** Public, read-only appointment information. Never include patient or queue data here. */
public record PublicDoctorSessionResponse(
        String sessionId, String doctorId, String doctorName,
        String specialization, String hospitalName,
        LocalDate sessionDate, String dayOfWeek,
        LocalTime startTime, LocalTime endTime,
        int remainingAppointments, SessionStatus status,
        String appointmentType) { }
