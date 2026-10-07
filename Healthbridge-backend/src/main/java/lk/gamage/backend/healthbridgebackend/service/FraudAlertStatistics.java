package lk.gamage.backend.healthbridgebackend.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FraudAlertStatistics {
    private Long totalAlerts;
    private Long pendingAlerts;
    private Long confirmedFraudAlerts;
    private Long falsePositiveAlerts;
    private Long criticalSeverityAlerts;

    public Double getPendingPercentage() {
        if (totalAlerts == 0) return 0.0;
        return (pendingAlerts / (double) totalAlerts) * 100;
    }

    public Double getConfirmedFraudPercentage() {
        if (totalAlerts == 0) return 0.0;
        return (confirmedFraudAlerts / (double) totalAlerts) * 100;
    }

    public Double getFalsePositivePercentage() {
        if (totalAlerts == 0) return 0.0;
        return (falsePositiveAlerts / (double) totalAlerts) * 100;
    }
}
