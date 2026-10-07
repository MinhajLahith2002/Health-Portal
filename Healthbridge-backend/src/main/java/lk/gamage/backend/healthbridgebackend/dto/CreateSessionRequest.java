package lk.gamage.backend.healthbridgebackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lk.gamage.backend.healthbridgebackend.model.ConsultationType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateSessionRequest {

    @NotBlank(message = "appointmentId is required")
    private String appointmentId;

    @NotBlank(message = "patientId is required")
    private String patientId;

    @NotBlank(message = "doctorId is required")
    private String doctorId;

    @NotNull(message = "consultationType is required")
    private ConsultationType consultationType;

    @NotNull(message = "scheduledStartTime is required")
    private LocalDateTime scheduledStartTime;

    private boolean recordingEnabled;
}