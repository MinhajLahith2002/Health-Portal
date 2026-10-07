package lk.gamage.backend.healthbridgebackend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class InsurancePolicyRequest {
    @NotBlank private String patientId;
    @NotBlank private String policyNumber;
    @NotBlank private String providerName;
    @NotBlank private String policyType;
    @NotNull @Positive private Double coverageAmount;
    @NotNull private LocalDate startDate;
    @NotNull private LocalDate endDate;
    
}
