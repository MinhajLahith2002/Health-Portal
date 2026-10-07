package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.FraudAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FraudAlertRepository extends MongoRepository<FraudAlert, String> {

    // Find alerts for a specific claim
    List<FraudAlert> findByClaimId(String claimId);

    // Find an existing detection result for idempotent claim analysis
    Optional<FraudAlert> findByClaimIdAndAlertType(String claimId, String alertType);

    // Find alerts for a patient by status
    List<FraudAlert> findByPatientIdAndStatus(String patientId, String status);

    // Find all alerts for a patient
    List<FraudAlert> findByPatientId(String patientId);

    // Find high-risk alerts (risk score > threshold)
    List<FraudAlert> findByRiskScoreGreaterThanAndStatus(Double riskScore, String status);

    // Find all high-risk alerts
    List<FraudAlert> findByRiskScoreGreaterThan(Double riskScore);

    // Find alerts by severity
    List<FraudAlert> findBySeverity(String severity);

    // Find recent alerts (created after a specific date)
    List<FraudAlert> findByCreatedAtAfterAndStatus(LocalDateTime date, String status);

    // Find all recent alerts
    List<FraudAlert> findByCreatedAtAfter(LocalDateTime date);

    // Count pending alerts
    Long countByStatus(String status);

    // Find alerts by alert type
    List<FraudAlert> findByAlertType(String alertType);

    // Find duplicate claims for a patient
    List<FraudAlert> findByPatientIdAndAlertTypeAndCreatedAtAfter(String patientId, String alertType, LocalDateTime date);

    // Find alerts for a policy
    List<FraudAlert> findByPolicyId(String policyId);

    // Custom query: Find high-risk alerts created in last N days
    @Query("{ 'createdAt': { $gte: ?0 }, 'riskScore': { $gte: ?1 } }")
    List<FraudAlert> findHighRiskAlertsInDateRange(LocalDateTime startDate, Double riskThreshold);

    // Find pending alerts ordered by risk score (highest first)
    List<FraudAlert> findByStatusOrderByRiskScoreDesc(String status);

    // Find alerts by multiple statuses
    List<FraudAlert> findByStatusIn(List<String> statuses);

    // Find similar alerts to link them
    List<FraudAlert> findByClaimIdAndAlertTypeAndCreatedAtAfter(String claimId, String alertType, LocalDateTime date);

    // Count alerts by severity
    Long countBySeverity(String severity);

    // Get distinct patient IDs with alerts
    @Query("{ 'patientId': { $exists: true } }")
    List<String> findDistinctPatientIds();

    // Check if alert exists for a claim
    Boolean existsByClaimId(String claimId);

    @Query("{ 'createdAt': { $lt: ?0 }, 'status': { $in: ?1 } }")
    @Update("{ '$set': { 'status': ?2, 'updatedAt': ?3 } }")
    long archiveResolvedOrFalsePositiveAlerts(
            LocalDateTime cutoff,
            List<String> statuses,
            String archivedStatus,
            LocalDateTime updatedAt);
}
