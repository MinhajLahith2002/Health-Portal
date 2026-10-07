package lk.gamage.backend.healthbridgebackend.service.impl;

import lk.gamage.backend.healthbridgebackend.enums.FraudAlertType;
import lk.gamage.backend.healthbridgebackend.enums.AlertSeverity;
import lk.gamage.backend.healthbridgebackend.enums.AlertStatus;
import lk.gamage.backend.healthbridgebackend.model.FraudAlert;
import lk.gamage.backend.healthbridgebackend.model.InsuranceClaim;
import lk.gamage.backend.healthbridgebackend.model.MedicalRecord;
import lk.gamage.backend.healthbridgebackend.repository.FraudAlertRepository;
import lk.gamage.backend.healthbridgebackend.repository.InsuranceClaimRepository;
import lk.gamage.backend.healthbridgebackend.repository.MedicalRecordRepository;
import lk.gamage.backend.healthbridgebackend.service.FraudDetectionService;
import lk.gamage.backend.healthbridgebackend.service.NotificationService;
import lk.gamage.backend.healthbridgebackend.service.FraudAlertStatistics;
import lk.gamage.backend.healthbridgebackend.exception.FraudDetectionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FraudDetectionServiceImpl implements FraudDetectionService {

    private static final Logger log = LoggerFactory.getLogger(FraudDetectionServiceImpl.class);

    @Autowired
    private InsuranceClaimRepository claimRepository;

    @Autowired
    private FraudAlertRepository fraudAlertRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private NotificationService notificationService;

    @Value("${fraud.detection.test-mode:false}")
    private boolean testMode;

    // Thresholds for fraud detection
    private static final Double OVERBILLING_RATIO_THRESHOLD = 1.5;  // 50% above average
    private static final Double HIGH_FREQUENCY_MULTIPLIER = 3.0;  // 3x average frequency
    private static final Integer DUPLICATE_CLAIM_DAYS = 30;  // Within 30 days
    private static final Integer FREQUENCY_HISTORY_MONTHS = 12;
    private static final Integer MINIMUM_FREQUENCY_HISTORY_CLAIMS = 3;
        private static final Integer MINIMUM_OVERBILLING_SAMPLE_SIZE = 3;
        private static final Set<String> VALID_BASELINE_STATUSES = Set.of(
            "SUBMITTED", "UNDER_REVIEW", "APPROVED", "PAID");

    @Override
    public FraudAlert analyzeClaimForFraud(String claimId) {
        try {
            InsuranceClaim claim = claimRepository.findById(claimId)
                    .orElseThrow(() -> new RuntimeException("Claim not found: " + claimId));

                List<FraudAlert> existingAlerts = fraudAlertRepository.findByClaimId(claimId);
                if (!existingAlerts.isEmpty()) {
                return existingAlerts.stream()
                    .max(Comparator.comparing(
                        FraudAlert::getRiskScore,
                        Comparator.nullsFirst(Double::compareTo)))
                    .orElse(null);
                }

            List<FraudAlert> alerts = new ArrayList<>();

            // Run all fraud detection checks
            FraudAlert duplicateAlert = checkDuplicateClaims(claimId);
            if (duplicateAlert != null) alerts.add(duplicateAlert);

            FraudAlert overbillingAlert = checkOverbilling(claimId);
            if (overbillingAlert != null) alerts.add(overbillingAlert);

            FraudAlert frequencyAlert = checkAbnormalFrequency(claim.getPatientId(), claimId);
            if (frequencyAlert != null) alerts.add(frequencyAlert);

            FraudAlert docMismatchAlert = checkDocumentationMismatch(claimId);
            if (docMismatchAlert != null) alerts.add(docMismatchAlert);

            FraudAlert medicalLogicAlert = checkMedicalLogic(claimId);
            if (medicalLogicAlert != null) alerts.add(medicalLogicAlert);

            if (testMode && alerts.isEmpty()) {
                alerts.add(createTestModeAlert(claim));
            }

            // Get highest risk alert
            FraudAlert highestRiskAlert = null;
            if (!alerts.isEmpty()) {
                highestRiskAlert = alerts.stream()
                        .max(Comparator.comparingDouble(FraudAlert::getRiskScore))
                        .orElse(null);

                if (highestRiskAlert != null) {
                        // Save every finding first so related IDs refer to persisted alerts.
                            List<FraudAlert> savedAlerts = alerts.stream()
                                .map(this::saveAlertIdempotently)
                                .collect(Collectors.toList());
                        List<String> alertIds = savedAlerts.stream()
                            .map(FraudAlert::getId)
                            .filter(Objects::nonNull)
                            .collect(Collectors.toList());
                        savedAlerts.forEach(alert -> alert.setRelatedAlertIds(alertIds));
                        fraudAlertRepository.saveAll(savedAlerts);
                        highestRiskAlert = savedAlerts.stream()
                            .max(Comparator.comparing(
                                FraudAlert::getRiskScore,
                                Comparator.nullsFirst(Double::compareTo)))
                            .orElse(null);

                    // Notify admin if high risk
                    if (highestRiskAlert.getRiskScore() > 70) {
                        notifyAdminFraudAlert(highestRiskAlert);
                    }
                }
            }

            return highestRiskAlert;

        } catch (FraudDetectionException e) {
            throw e;
        } catch (Exception e) {
            log.error("Fraud analysis failed claimId={}", claimId, e);
            throw new FraudDetectionException("Fraud detection failed for claim " + claimId, e);
        }
    }

    private FraudAlert saveAlertIdempotently(FraudAlert alert) {
        Optional<FraudAlert> existing = fraudAlertRepository
                .findByClaimIdAndAlertType(alert.getClaimId(), alert.getAlertType());
        if (existing.isPresent()) {
            return existing.get();
        }

        try {
            return fraudAlertRepository.save(alert);
        } catch (DuplicateKeyException exception) {
            return fraudAlertRepository.findByClaimIdAndAlertType(alert.getClaimId(), alert.getAlertType())
                    .orElseThrow(() -> exception);
        }
    }

    private FraudAlert createTestModeAlert(InsuranceClaim claim) {
        return FraudAlert.builder()
                .claimId(claim.getId())
                .patientId(claim.getPatientId())
                .policyId(claim.getPolicyId())
                .alertType(FraudAlertType.UNKNOWN.toString())
                .description("Test mode: claim flagged for fraud review so the detection workflow can be verified")
                .severity(AlertSeverity.HIGH.toString())
                .riskScore(75.0)
                .status(AlertStatus.PENDING.toString())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Override
    public FraudAlert checkDuplicateClaims(String claimId) {
        try {
            InsuranceClaim claim = requireValidClaim(claimId);

            // Search for same treatment claimed by same patient within DUPLICATE_CLAIM_DAYS
            List<InsuranceClaim> similarClaims = claimRepository.findByPatientIdAndTreatmentDescriptionAndSubmittedAtAfter(
                    claim.getPatientId(),
                    claim.getTreatmentDescription(),
                    claim.getSubmittedAt().minusDays(DUPLICATE_CLAIM_DAYS)
            );

            if (similarClaims.size() > 1) {
                InsuranceClaim similarClaim = similarClaims.stream()
                        .filter(c -> !c.getId().equals(claimId))
                        .findFirst()
                        .orElse(null);

                return FraudAlert.builder()
                        .claimId(claimId)
                        .patientId(claim.getPatientId())
                        .policyId(claim.getPolicyId())
                        .doctorId(null)
                        .alertType(FraudAlertType.DUPLICATE_CLAIM.toString())
                        .description("Same treatment claimed " + similarClaims.size() + " times within " + DUPLICATE_CLAIM_DAYS + " days")
                        .severity(AlertSeverity.CRITICAL.toString())
                        .riskScore(85.0)
                        .status(AlertStatus.PENDING.toString())
                        .similarClaimId(similarClaim != null ? similarClaim.getId() : null)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
            }

            return null;

        } catch (FraudDetectionException e) {
            throw e;
        } catch (Exception e) {
            throw new FraudDetectionException("Duplicate claim check failed for claim " + claimId, e);
        }
    }

    @Override
    public FraudAlert checkOverbilling(String claimId) {
        try {
            InsuranceClaim claim = requireValidClaim(claimId);

                // Compare against the median of valid, non-rejected peer claims.
                List<Double> baselineAmounts = claimRepository.findByTreatmentDescription(
                        claim.getTreatmentDescription())
                    .stream()
                    .filter(candidate -> !claimId.equals(candidate.getId()))
                    .filter(candidate -> candidate.getStatus() != null
                        && VALID_BASELINE_STATUSES.contains(candidate.getStatus().toString()))
                    .map(InsuranceClaim::getClaimAmount)
                    .filter(Objects::nonNull)
                    .filter(amount -> amount >= 0)
                    .sorted()
                    .collect(Collectors.toList());

                if (baselineAmounts.size() < MINIMUM_OVERBILLING_SAMPLE_SIZE
                    || claim.getClaimAmount() == null || claim.getClaimAmount() < 0) {
                return null;
            }

                double medianAmount = median(baselineAmounts);
                if (medianAmount <= 0) {
                return null;
                }
                Double claimRatio = claim.getClaimAmount() / medianAmount;

            if (claimRatio > OVERBILLING_RATIO_THRESHOLD) {  // 50% higher than average
                return FraudAlert.builder()
                        .claimId(claimId)
                        .patientId(claim.getPatientId())
                        .policyId(claim.getPolicyId())
                        .doctorId(null)
                        .alertType(FraudAlertType.OVERBILLING.toString())
                        .description("Claim amount $" + claim.getClaimAmount() + " is " + String.format("%.0f%%", (claimRatio - 1) * 100) + " higher than the median baseline ($" + medianAmount + ")")
                        .severity(AlertSeverity.HIGH.toString())
                        .riskScore(70.0)
                        .status(AlertStatus.PENDING.toString())
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
            }

            return null;

        } catch (FraudDetectionException e) {
            throw e;
        } catch (Exception e) {
            throw new FraudDetectionException("Overbilling check failed for claim " + claimId, e);
        }
    }

    @Override
    public FraudAlert checkAbnormalFrequency(String patientId, String claimId) {
        try {
            InsuranceClaim claim = requireValidClaim(claimId);
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime historyStart = now.minusMonths(FREQUENCY_HISTORY_MONTHS);
            LocalDateTime frequencyWindowStart = now.minusDays(30);
            List<InsuranceClaim> historicalClaims = claimRepository.findByPatientIdAndSubmittedAtBetween(
                patientId, historyStart, now);
            long historicalClaimCount = historicalClaims.stream()
                .filter(historyClaim -> !claimId.equals(historyClaim.getId()))
                .count();

            if (historicalClaimCount < MINIMUM_FREQUENCY_HISTORY_CLAIMS) {
            return null;
            }

            long claimsLastMonth = historicalClaims.stream()
                .filter(historyClaim -> !claimId.equals(historyClaim.getId()))
                .filter(historyClaim -> historyClaim.getSubmittedAt() != null
                    && historyClaim.getSubmittedAt().isAfter(frequencyWindowStart))
                .count();
            double averageMonthlyFrequency = historicalClaimCount / (double) FREQUENCY_HISTORY_MONTHS;

            if (claimsLastMonth > averageMonthlyFrequency * HIGH_FREQUENCY_MULTIPLIER) {
                return FraudAlert.builder()
                        .claimId(claimId)
                        .patientId(patientId)
                        .alertType(FraudAlertType.HIGH_FREQUENCY.toString())
                        .description("Patient claimed " + claimsLastMonth + " times this month (average: " + String.format("%.1f", averageMonthlyFrequency) + ")")
                        .severity(AlertSeverity.MEDIUM.toString())
                        .riskScore(55.0)
                        .status(AlertStatus.PENDING.toString())
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
            }

            return null;

        } catch (FraudDetectionException e) {
            throw e;
        } catch (Exception e) {
            throw new FraudDetectionException("Frequency check failed for claim " + claimId, e);
        }
    }

    @Override
    public FraudAlert checkDocumentationMismatch(String claimId) {
        try {
            InsuranceClaim claim = requireValidClaim(claimId);

            // Check if required documents are present
            if (claim.getDocumentFileIds() == null || claim.getDocumentFileIds().isEmpty()) {
                return FraudAlert.builder()
                        .claimId(claimId)
                        .patientId(claim.getPatientId())
                        .policyId(claim.getPolicyId())
                        .doctorId(null)
                        .alertType(FraudAlertType.DOCUMENTATION_MISMATCH.toString())
                        .description("Missing required supporting documentation")
                        .severity(AlertSeverity.MEDIUM.toString())
                        .riskScore(40.0)
                        .status(AlertStatus.PENDING.toString())
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
            }

            return null;

        } catch (FraudDetectionException e) {
            throw e;
        } catch (Exception e) {
            throw new FraudDetectionException("Documentation check failed for claim " + claimId, e);
        }
    }

    @Override
    public FraudAlert checkMedicalLogic(String claimId) {
        try {
            InsuranceClaim claim = requireValidClaim(claimId);

            // Get patient's medical records
            List<MedicalRecord> medicalRecords = medicalRecordRepository.findByPatientIdOrderByVisitDateDesc(claim.getPatientId());

            // Simple logic check: verify treatment matches patient's medical history
            boolean hasMatchingDiagnosis = medicalRecords.stream()
                    .filter(mr -> mr.getDiagnosis() != null && !mr.getDiagnosis().isBlank())
                    .anyMatch(mr -> claim.getTreatmentDescription().toLowerCase()
                        .contains(mr.getDiagnosis().toLowerCase()));

            if (!hasMatchingDiagnosis && !medicalRecords.isEmpty()) {
                return FraudAlert.builder()
                        .claimId(claimId)
                        .patientId(claim.getPatientId())
                        .policyId(claim.getPolicyId())
                        .doctorId(null)
                        .alertType(FraudAlertType.UNUSUAL_DIAGNOSIS.toString())
                        .description("Claimed treatment does not match patient's medical history")
                        .severity(AlertSeverity.MEDIUM.toString())
                        .riskScore(50.0)
                        .status(AlertStatus.PENDING.toString())
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
            }

            return null;

        } catch (FraudDetectionException e) {
            throw e;
        } catch (Exception e) {
            throw new FraudDetectionException("Medical logic check failed for claim " + claimId, e);
        }
    }

    private InsuranceClaim requireValidClaim(String claimId) {
        if (claimId == null || claimId.isBlank()) {
            throw new FraudDetectionException("Claim ID is required for fraud analysis");
        }

        InsuranceClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new FraudDetectionException("Claim not found: " + claimId));
        if (claim.getPatientId() == null || claim.getPatientId().isBlank()
                || claim.getSubmittedAt() == null
                || claim.getClaimAmount() == null || claim.getClaimAmount() < 0
                || claim.getTreatmentDescription() == null || claim.getTreatmentDescription().isBlank()) {
            throw new FraudDetectionException("Claim has incomplete or invalid fraud-analysis data: " + claimId);
        }
        return claim;
    }

    private double median(List<Double> sortedValues) {
        int middle = sortedValues.size() / 2;
        if (sortedValues.size() % 2 == 0) {
            return (sortedValues.get(middle - 1) + sortedValues.get(middle)) / 2.0;
        }
        return sortedValues.get(middle);
    }

    @Override
    public List<FraudAlert> getPendingAlerts() {
        try {
            return fraudAlertRepository.findByStatusOrderByRiskScoreDesc(AlertStatus.PENDING.toString());
        } catch (Exception e) {
            log.error("Failed to retrieve pending fraud alerts", e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<FraudAlert> getHighRiskAlerts() {
        try {
            return fraudAlertRepository.findByRiskScoreGreaterThan(60.0);
        } catch (Exception e) {
            log.error("Failed to retrieve high-risk fraud alerts", e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<FraudAlert> getRecentAlerts(Integer daysBack) {
        try {
            LocalDateTime startDate = LocalDateTime.now().minusDays(daysBack);
            ensureRecentClaimsAnalyzed(startDate);
            return fraudAlertRepository.findByCreatedAtAfter(startDate);
        } catch (Exception e) {
            log.error("Failed to retrieve recent fraud alerts daysBack={}", daysBack, e);
            return new ArrayList<>();
        }
    }

    private void ensureRecentClaimsAnalyzed(LocalDateTime startDate) {
        claimRepository.findBySubmittedAtAfter(startDate).stream()
                .filter(claim -> claim.getId() != null && !fraudAlertRepository.existsByClaimId(claim.getId()))
                .forEach(claim -> {
                    try {
                        analyzeClaimForFraud(claim.getId());
                    } catch (RuntimeException exception) {
                        log.error("Could not analyze existing claim claimId={}", claim.getId(), exception);
                    }
                });
    }

    @Override
    public List<FraudAlert> getAlertsByPatientId(String patientId) {
        try {
            return fraudAlertRepository.findByPatientId(patientId);
        } catch (Exception e) {
            log.error("Failed to retrieve fraud alerts patientId={}", patientId, e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<FraudAlert> getAlertsByClaimId(String claimId) {
        try {
            return fraudAlertRepository.findByClaimId(claimId);
        } catch (Exception e) {
            log.error("Failed to retrieve fraud alerts claimId={}", claimId, e);
            return new ArrayList<>();
        }
    }

    @Override
    public FraudAlert reviewAlert(String alertId, AlertStatus status, String reviewNotes, String reviewerId) {
        try {
            FraudAlert alert = fraudAlertRepository.findById(alertId)
                    .orElseThrow(() -> new FraudDetectionException("Alert not found: " + alertId));

            if (status == null || reviewerId == null || reviewerId.isBlank()) {
                throw new FraudDetectionException("Review status and reviewer identity are required");
            }
            AlertStatus currentStatus = parseAlertStatus(alert.getStatus());
            if (currentStatus != AlertStatus.PENDING && currentStatus != AlertStatus.UNDER_REVIEW) {
                throw new FraudDetectionException("Alert cannot be reviewed from status " + currentStatus);
            }
            if (status == AlertStatus.PENDING || status == AlertStatus.ARCHIVED) {
                throw new FraudDetectionException("Invalid review status: " + status);
            }

            alert.setStatus(status.toString());
            alert.setReviewNotes(reviewNotes);
            alert.setReviewedByOfficerId(reviewerId);
            alert.setReviewedAt(LocalDateTime.now());
            alert.setUpdatedAt(LocalDateTime.now());

            return fraudAlertRepository.save(alert);

        } catch (FraudDetectionException e) {
            throw e;
        } catch (Exception e) {
            throw new FraudDetectionException("Alert review failed for " + alertId, e);
        }
    }

    private AlertStatus parseAlertStatus(String status) {
        try {
            return AlertStatus.valueOf(status);
        } catch (Exception exception) {
            throw new FraudDetectionException("Stored alert has invalid status: " + status, exception);
        }
    }

    @Override
    public FraudAlertStatistics getAlertStatistics() {
        try {
            Long totalAlerts = fraudAlertRepository.count();
            Long pendingAlerts = fraudAlertRepository.countByStatus(AlertStatus.PENDING.toString());
            Long confirmedFraud = fraudAlertRepository.countByStatus(AlertStatus.CONFIRMED_FRAUD.toString());
            Long falsePositives = fraudAlertRepository.countByStatus(AlertStatus.FALSE_POSITIVE.toString());
            Long criticalAlerts = fraudAlertRepository.countBySeverity(AlertSeverity.CRITICAL.toString());

            return new FraudAlertStatistics(
                    totalAlerts,
                    pendingAlerts,
                    confirmedFraud,
                    falsePositives,
                    criticalAlerts
            );

        } catch (Exception e) {
            log.error("Failed to retrieve fraud alert statistics", e);
            return new FraudAlertStatistics(0L, 0L, 0L, 0L, 0L);
        }
    }

    @Override
    public void archiveOldAlerts(Integer daysOld) {
        try {
            if (daysOld == null || daysOld < 1) {
                throw new FraudDetectionException("Archive age must be at least one day");
            }
            LocalDateTime archiveDate = LocalDateTime.now().minusDays(daysOld);
            long archivedCount = fraudAlertRepository.archiveResolvedOrFalsePositiveAlerts(
                    archiveDate,
                    List.of(AlertStatus.RESOLVED.toString(), AlertStatus.FALSE_POSITIVE.toString()),
                    AlertStatus.ARCHIVED.toString(),
                    LocalDateTime.now());

            log.info("Archived fraud alerts count={}", archivedCount);

        } catch (Exception e) {
            throw new FraudDetectionException("Alert archival failed", e);
        }
    }

    @Override
    public List<FraudAlert> analyzeBulkClaims(List<String> claimIds) {
        try {
            return claimIds.stream()
                    .map(this::analyzeClaimForFraud)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Bulk fraud analysis failed", e);
            return new ArrayList<>();
        }
    }

    private void notifyAdminFraudAlert(FraudAlert alert) {
        try {
            // Send notification to admin
                log.warn("High-risk fraud alert detected claimId={}", alert.getClaimId());
        } catch (Exception e) {
            log.error("Failed to notify admin claimId={}", alert.getClaimId(), e);
        }
    }
}
