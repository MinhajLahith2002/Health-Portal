package lk.gamage.backend.healthbridgebackend.dto.response;

import lk.gamage.backend.healthbridgebackend.enums.AppointmentStatus;
import lk.gamage.backend.healthbridgebackend.enums.DoctorDecision;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AppointmentResponse(String id, String patientId, String doctorId, String doctorName,
                                  String doctorSpecialization, String hospital, LocalDate appointmentDate,
                                  String appointmentTime, String appointmentType, String reason,
                                  AppointmentStatus status, DoctorDecision doctorDecision, String cancellationReason,
                                  LocalDateTime createdAt, LocalDateTime updatedAt) { }
