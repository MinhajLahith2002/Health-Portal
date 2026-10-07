package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.enums.ClaimStatus;
import lk.gamage.backend.healthbridgebackend.model.InsuranceClaim;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InsuranceClaimRepository extends MongoRepository<InsuranceClaim, String> {
    
    // Basic find methods
    List<InsuranceClaim> findByPatientId(String patientId);
    List<InsuranceClaim> findByPolicyId(String policyId);
    List<InsuranceClaim> findByStatus(ClaimStatus status);
    Optional<InsuranceClaim> findByClaimNumber(String claimNumber);

    // Fraud detection related queries
    List<InsuranceClaim> findByPatientIdAndTreatmentDescriptionAndSubmittedAtAfter(
            String patientId, String treatmentDescription, LocalDateTime submittedAfter);

    // Count queries for frequency detection
    Integer countByPatientIdAndSubmittedAtAfter(String patientId, LocalDateTime submittedAfter);
    
    Integer countByPatientIdAndStatusAndSubmittedAtAfter(String patientId, String status, LocalDateTime submittedAfter);

    // Average claim amount for overbilling detection
    @Query("{ 'treatmentDescription': ?0 }")
    List<InsuranceClaim> findByTreatmentDescription(String treatmentDescription);

    @Query(value = "{ 'treatmentDescription': ?0 }", fields = "{ 'claimAmount': 1 }")
    List<InsuranceClaim> findClaimAmountByTreatmentDescription(String treatmentDescription);

    // Custom query for average
    // Find claims by multiple statuses
    List<InsuranceClaim> findByStatusIn(List<String> statuses);

    // Recent claims
    List<InsuranceClaim> findBySubmittedAtAfter(LocalDateTime submittedAfter);

    // Claims for a patient in a date range
    List<InsuranceClaim> findByPatientIdAndSubmittedAtBetween(
            String patientId, LocalDateTime startDate, LocalDateTime endDate);

    // Check if similar claim exists
    Boolean existsByPatientIdAndTreatmentDescriptionAndSubmittedAtAfter(
            String patientId, String treatmentDescription, LocalDateTime submittedAfter);
}