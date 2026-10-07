package lk.gamage.backend.healthbridgebackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FraudAlertStatisticsResponse {
    
    private Long totalAlerts;
    private Long pendingAlerts;
    private Long confirmedFraudAlerts;
    private Long falsePositiveAlerts;
    private Long criticalSeverityAlerts;
    
    private Double pendingPercentage;
    private Double confirmedFraudPercentage;
    private Double falsePositivePercentage;
}
