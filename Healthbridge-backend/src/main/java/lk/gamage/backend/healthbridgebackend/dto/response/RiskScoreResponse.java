package lk.gamage.backend.healthbridgebackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskScoreResponse {
    
    private String id;
    private String patientId;
    private String doctorId;
    private String policyId;
    
    private Double patientRiskScore;
    private Double doctorRiskScore;
    private Double claimRiskScore;
    
    private Double claimAmountScore;
    private Double frequencyScore;
    private Double doctorReputationScore;
    private Double documentationScore;
    private Double medicalLogicScore;
    
    private Integer totalClaimsLastYear;
    private Integer rejectedClaimsLastYear;
    private Double averageClaimAmountLastYear;
    
    private Integer flaggedClaimsCount;
    private Integer confirmedFraudCount;
    
    private String riskTrend;
    private String notes;
    
    private LocalDateTime calculatedAt;
    private LocalDateTime lastUpdated;
}
