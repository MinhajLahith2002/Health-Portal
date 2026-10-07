package lk.gamage.backend.healthbridgebackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskScoreBreakdownResponse {
    
    private Double overallRiskScore;
    private Double claimAmountScore;
    private Double frequencyScore;
    private Double documentationScore;
    
    private Integer flaggedClaimsCount;
    private String riskTrend;
    private String riskLevel;
}
