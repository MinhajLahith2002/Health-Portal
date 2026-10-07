package lk.gamage.backend.healthbridgebackend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AppointmentBookingRequest(
        @NotBlank String sessionId,
        @NotBlank @Size(max = 120) String patientName,
        @NotBlank @Pattern(regexp = "^[+0-9() -]{7,20}$", message = "Please enter a valid phone number") String patientPhone,
        @NotBlank @Size(min = 5, max = 30) String nicOrPassport,
        @Email String email,
        @Size(max = 300) String address) { }
