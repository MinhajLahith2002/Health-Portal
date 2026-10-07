package lk.gamage.backend.healthbridgebackend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AppointmentRescheduleRequest(@NotBlank String sessionId) { }
