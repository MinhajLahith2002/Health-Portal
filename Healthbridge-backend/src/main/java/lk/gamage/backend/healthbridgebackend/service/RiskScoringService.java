package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.model.RiskScore;

import java.util.List;

public interface RiskScoringService {

    /**
     * Calculate overall risk score for a specific claim
     */
    RiskScore calculateClaimRiskScore(String claimId);

    /**
     * Calculate overall risk score for a patient based on all their claims
     */
    RiskScore calculatePatientRiskScore(String patientId);

    /**
     * Get existing patient risk score
     */
    RiskScore getPatientRiskScore(String patientId);

    /**
     * Get existing policy risk score
     */
    RiskScore getPolicyRiskScore(String policyId);

    /**
     * Recalculate all risk scores in the system
     * Should be run periodically (e.g., daily)
     */
    void recalculateAllRiskScores();

    /**
     * Get high-risk patients (risk score > 50)
     */
    List<RiskScore> getHighRiskPatients();

    /**
     * Get patients with increasing risk trend
     */
    List<RiskScore> getPatientsWithIncreasingRisk();

    /**
     * Get risk score statistics
     */
    RiskScoreStatistics getRiskScoreStatistics();

    /**
     * Update risk trend for all entities
     */
    void updateAllRiskTrends();

    /**
     * Get risk score breakdown for a patient
     */
    RiskScoreBreakdown getPatientRiskBreakdown(String patientId);

    /**
     * Archive inactive risk scores
     */
    void archiveInactiveScores();
}
