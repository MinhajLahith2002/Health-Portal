package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.RiskScore;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RiskScoreRepository extends MongoRepository<RiskScore, String> {

    // Find risk score by patient
    Optional<RiskScore> findByPatientId(String patientId);

    // Find risk score by doctor
    Optional<RiskScore> findByDoctorId(String doctorId);

    // Find risk score by policy
    Optional<RiskScore> findByPolicyId(String policyId);

    // Find high-risk patients (patient risk score > threshold)
    List<RiskScore> findByPatientRiskScoreGreaterThan(Double riskScore);

    // Find high-risk patients by threshold and active status
    List<RiskScore> findByPatientRiskScoreGreaterThanAndIsActive(Double riskScore, Boolean isActive);

    // Find high-risk doctors
    List<RiskScore> findByDoctorRiskScoreGreaterThan(Double riskScore);

    // Find high-risk doctors by threshold and active status
    List<RiskScore> findByDoctorRiskScoreGreaterThanAndIsActive(Double riskScore, Boolean isActive);

    // Find scores by risk trend
    List<RiskScore> findByRiskTrend(String riskTrend);

    // Find scores that need recalculation (next calculation date passed)
    @Query("{ 'nextCalculationAt': { $lte: new Date() } }")
    List<RiskScore> findScoresDueForRecalculation();

    // Find scores updated before a specific date
    List<RiskScore> findByLastUpdatedBefore(LocalDateTime date);

    // Find active scores
    List<RiskScore> findByIsActive(Boolean isActive);

    // Find scores with confirmed fraud
    List<RiskScore> findByConfirmedFraudCountGreaterThan(Integer count);

    // Find scores with multiple flagged claims
    List<RiskScore> findByFlaggedClaimsCountGreaterThan(Integer count);

    // Custom query: Find patients with increasing risk trend
    @Query("{ 'riskTrend': 'INCREASING', 'patientRiskScore': { $gte: 50 } }")
    List<RiskScore> findIncreasingSuspiciousPatients();

    // Custom query: Find doctors with high rejection rate
    @Query("{ 'doctorRiskScore': { $gte: 60 }, 'rejectedClaimsLastYear': { $gte: 5 } }")
    List<RiskScore> findSuspiciousDoctors();

    // Find scores by patient ID ordered by risk score (highest first)
    Optional<RiskScore> findByPatientIdOrderByPatientRiskScoreDesc(String patientId);

    // Find multiple patients by IDs
    List<RiskScore> findByPatientIdIn(List<String> patientIds);

    // Find multiple doctors by IDs
    List<RiskScore> findByDoctorIdIn(List<String> doctorIds);

    // Count active risk scores
    Long countByIsActive(Boolean isActive);

    // Count patients with high risk
    Long countByPatientRiskScoreGreaterThan(Double riskScore);

    // Count doctors with high risk
    Long countByDoctorRiskScoreGreaterThan(Double riskScore);

    // Check if risk score exists for patient
    Boolean existsByPatientId(String patientId);

    // Check if risk score exists for doctor
    Boolean existsByDoctorId(String doctorId);
}
