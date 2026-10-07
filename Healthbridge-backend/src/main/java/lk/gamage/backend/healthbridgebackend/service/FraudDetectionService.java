package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.model.FraudAlert;
import lk.gamage.backend.healthbridgebackend.enums.AlertStatus;

import java.util.List;

public interface FraudDetectionService {

    /**
     * Main method to analyze a claim for fraud
     * Runs all fraud detection checks and returns the highest risk alert
     */
    FraudAlert analyzeClaimForFraud(String claimId);

    /**
     * Check if a patient has claimed the same treatment multiple times within a short period
     */
    FraudAlert checkDuplicateClaims(String claimId);

    /**
     * Check if claim amount is significantly higher than average for the same treatment
     */
    FraudAlert checkOverbilling(String claimId);

    /**
     * Check if patient has abnormally high claim frequency
     */
    FraudAlert checkAbnormalFrequency(String patientId, String claimId);

    /**
     * Check for suspicious patterns in a doctor's claim submissions
     */
    /**
     * Check if documentation is complete and matches the claim
     */
    FraudAlert checkDocumentationMismatch(String claimId);

    /**
     * Check if medical procedures/diagnoses follow logical patterns
     */
    FraudAlert checkMedicalLogic(String claimId);

    /**
     * Get all pending fraud alerts awaiting review
     */
    List<FraudAlert> getPendingAlerts();

    /**
     * Get high-risk alerts (risk score > 60)
     */
    List<FraudAlert> getHighRiskAlerts();

    /**
     * Get recent alerts created in the last N days
     */
    List<FraudAlert> getRecentAlerts(Integer daysBack);

    /**
     * Get alerts for a specific patient
     */
    List<FraudAlert> getAlertsByPatientId(String patientId);

    /**
     * Get alerts for a specific claim
     */
    List<FraudAlert> getAlertsByClaimId(String claimId);

    /**
     * Review an alert and mark as confirmed fraud or false positive
     */
    FraudAlert reviewAlert(String alertId, AlertStatus status, String reviewNotes, String reviewerId);

    /**
     * Get alert statistics (total, by status, by severity)
     */
    FraudAlertStatistics getAlertStatistics();

    /**
     * Delete old resolved alerts (older than specified days)
     */
    void archiveOldAlerts(Integer daysOld);

    /**
     * Bulk analyze multiple claims
     */
    List<FraudAlert> analyzeBulkClaims(List<String> claimIds);
}
