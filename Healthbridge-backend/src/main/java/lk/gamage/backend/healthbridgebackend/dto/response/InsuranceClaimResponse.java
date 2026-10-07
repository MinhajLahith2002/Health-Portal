package lk.gamage.backend.healthbridgebackend.dto.response;

import lk.gamage.backend.healthbridgebackend.enums.ClaimStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class InsuranceClaimResponse {
    private String id;
    private String claimNumber;
    private String policyId;
    private String policyNumber;
    private String providerName;
    private String patientId;
    private String treatmentDescription;
    private String hospitalName;
    private String branch;
    private Double claimAmount;
    private Double approvedAmount;
    private List<String> documentUrls;
    private List<String> documentFileIds;
    private ClaimStatus status;
    private String rejectionReason;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
}
