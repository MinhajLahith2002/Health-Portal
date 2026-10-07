package lk.gamage.backend.healthbridgebackend.scheduler;

import lk.gamage.backend.healthbridgebackend.service.FraudDetectionService;
import lk.gamage.backend.healthbridgebackend.service.RiskScoringService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class FraudRiskScheduler {

    private static final Logger log = LoggerFactory.getLogger(FraudRiskScheduler.class);

    @Autowired
    private RiskScoringService riskScoringService;

    @Autowired
    private FraudDetectionService fraudDetectionService;

    /**
     * Recalculate all risk scores daily at 2:00 AM
     * Helps keep risk assessments up-to-date
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void recalculateAllRiskScores() {
        try {
            LocalDateTime startTime = LocalDateTime.now();
            log.info("Started risk score recalculation startTime={}", startTime);
            
            riskScoringService.recalculateAllRiskScores();
            
            LocalDateTime endTime = LocalDateTime.now();
            long durationSeconds = java.time.temporal.ChronoUnit.SECONDS.between(startTime, endTime);
                log.info("Completed risk score recalculation endTime={} durationSeconds={}", endTime, durationSeconds);
            
        } catch (Exception e) {
            log.error("Risk score recalculation failed", e);
        }
    }

    /**
     * Update risk trends daily at 3:00 AM
     * Analyzes if risk is increasing, decreasing, or stable
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void updateAllRiskTrends() {
        try {
            log.info("Started risk trend update");
            
            riskScoringService.updateAllRiskTrends();
            
            log.info("Completed risk trend update");
            
        } catch (Exception e) {
            log.error("Risk trend update failed", e);
        }
    }

    /**
     * Archive old resolved alerts daily at 4:00 AM
     * Cleans up alerts older than 90 days with RESOLVED or FALSE_POSITIVE status
     */
    @Scheduled(cron = "0 0 4 * * *")
    public void archiveOldAlerts() {
        try {
            log.info("Started old fraud alert archival");
            
            // Archive alerts resolved more than 90 days ago
            fraudDetectionService.archiveOldAlerts(90);
            
            log.info("Completed old fraud alert archival");
            
        } catch (Exception e) {
            log.error("Fraud alert archival failed", e);
        }
    }

    /**
     * Archive inactive risk scores daily at 5:00 AM
     * Removes scores for inactive patients/doctors
     */
    @Scheduled(cron = "0 0 5 * * *")
    public void archiveInactiveScores() {
        try {
            log.info("Started inactive risk score archival");
            
            riskScoringService.archiveInactiveScores();
            
            log.info("Completed inactive risk score archival");
            
        } catch (Exception e) {
            log.error("Inactive risk score archival failed", e);
        }
    }

    /**
     * Perform periodic cleanup and maintenance every week (Sunday at 6:00 AM)
     */
    @Scheduled(cron = "0 0 6 ? * SUN")
    public void weeklyMaintenance() {
        try {
            log.info("Started weekly fraud maintenance");
            
            // Run all maintenance tasks
            recalculateAllRiskScores();
            updateAllRiskTrends();
            archiveOldAlerts();
            archiveInactiveScores();
            
            log.info("Completed weekly fraud maintenance");
            
        } catch (Exception e) {
            log.error("Weekly fraud maintenance failed", e);
        }
    }
}
