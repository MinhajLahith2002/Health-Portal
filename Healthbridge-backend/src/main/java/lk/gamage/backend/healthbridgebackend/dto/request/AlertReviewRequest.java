package lk.gamage.backend.healthbridgebackend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import lk.gamage.backend.healthbridgebackend.enums.AlertStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlertReviewRequest {
    
    @NotNull(message = "Status is required")
    private AlertStatus status;
    
    private String reviewNotes;
}
