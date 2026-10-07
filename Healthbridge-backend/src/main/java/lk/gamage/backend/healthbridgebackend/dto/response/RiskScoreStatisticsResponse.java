package lk.gamage.backend.healthbridgebackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskScoreStatisticsResponse {
    
    private Long highRiskPatients;
    private Long totalActiveScores;
    private Long patientsWithIncreasingRisk;
    
    private Double highRiskPercentage;
    private Long totalHighRiskEntities;
}
