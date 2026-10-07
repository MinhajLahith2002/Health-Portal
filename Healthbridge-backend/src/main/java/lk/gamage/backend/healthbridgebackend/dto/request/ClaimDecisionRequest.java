package lk.gamage.backend.healthbridgebackend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ClaimDecisionRequest {
    @NotNull private Boolean approve;      // true = approve, false = reject
    private Double approvedAmount;         // required if approve = true
    private String rejectionReason;        // required if approve = false
    
}
