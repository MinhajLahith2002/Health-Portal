package lk.gamage.backend.healthbridgebackend.dto.request;

import java.time.LocalDate;

public record AppointmentRequest(String patientId, String doctorId, String doctorName,
                                 String doctorSpecialization, String hospital,
                                 LocalDate appointmentDate, String appointmentTime,
                                 String appointmentType, String reason) { }
