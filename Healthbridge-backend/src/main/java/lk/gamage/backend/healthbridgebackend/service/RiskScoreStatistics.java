package lk.gamage.backend.healthbridgebackend.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RiskScoreStatistics {
    private Long highRiskPatients;
    private Long totalActiveScores;
    private Long patientsWithIncreasingRisk;

    public Double getHighRiskPercentage() {
        if (totalActiveScores == 0) return 0.0;
        return (highRiskPatients / (double) totalActiveScores) * 100;
    }

    public Long getTotalHighRiskEntities() {
        return highRiskPatients;
    }
}
