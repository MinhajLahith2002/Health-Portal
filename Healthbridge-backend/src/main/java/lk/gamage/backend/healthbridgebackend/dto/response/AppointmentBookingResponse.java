package lk.gamage.backend.healthbridgebackend.dto.response;

import java.time.LocalDate;
import java.time.LocalTime;
import lk.gamage.backend.healthbridgebackend.enums.AppointmentStatus;

public record AppointmentBookingResponse(
        String appointmentId, String referenceNumber, int appointmentNumber,
        String sessionId, String patientId, String patientName,
        String doctorId, String doctorName, String hospitalId, String hospitalName,
        String specialization, LocalDate date, LocalTime sessionTime,
        int currentQueueNumber, AppointmentStatus status,
        String patientPhone, String patientNicOrPassport, String patientEmail,
        String patientAddress, String cancelReason, String appointmentType) { }