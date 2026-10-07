package lk.gamage.backend.healthbridgebackend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class InsuranceClaimRequest {
    @NotBlank private String policyId;
    @NotBlank private String treatmentDescription;
    private String hospitalName;
    private String branch;
    @NotNull @Positive private Double claimAmount;
    // documents come in as separate multipart files, not in this JSON body
}
