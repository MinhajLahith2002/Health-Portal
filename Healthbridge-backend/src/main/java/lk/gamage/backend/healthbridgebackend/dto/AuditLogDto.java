package lk.gamage.backend.healthbridgebackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuditLogDto {

    @NotBlank(message = "User is required")
    private String user;

    private String role;

    @NotBlank(message = "Event is required")
    private String event;

    private String module;

    @NotBlank(message = "Action details are required")
    private String actionDetails;

    private String refId;

    private String ipDevice;

    @NotBlank(message = "Status is required")
    private String status;

    @NotBlank(message = "Severity is required")
    private String severity;
}
