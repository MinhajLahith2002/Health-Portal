package lk.gamage.backend.healthbridgebackend.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskScoreBreakdown {
    private Double overallRiskScore;
    private Double claimAmountScore;
    private Double frequencyScore;
    private Double documentationScore;
    private Integer flaggedClaimsCount;
    private String riskTrend;

    public String getRiskLevel() {
        if (overallRiskScore == null) return "UNKNOWN";
        if (overallRiskScore < 30) return "LOW";
        if (overallRiskScore < 60) return "MEDIUM";
        if (overallRiskScore < 80) return "HIGH";
        return "CRITICAL";
    }
}
