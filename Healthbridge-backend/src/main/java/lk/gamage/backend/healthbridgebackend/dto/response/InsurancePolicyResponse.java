package lk.gamage.backend.healthbridgebackend.dto.response;

import lk.gamage.backend.healthbridgebackend.enums.PolicyStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class InsurancePolicyResponse {
    private String id;
    private String policyNumber;
    private String patientId;
    private String providerName;
    private String policyType;
    private Double coverageAmount;
    private Double coverageUsed;
    private Double coverageRemaining;
    private LocalDate startDate;
    private LocalDate endDate;
    private PolicyStatus status;
    
}
