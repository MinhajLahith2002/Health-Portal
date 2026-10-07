package lk.gamage.backend.healthbridgebackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JoinSessionRequest {

    @NotBlank(message = "userId is required")
    private String userId;

    /** "PATIENT" or "DOCTOR" */
    @NotBlank(message = "role is required")
    private String role;
}
