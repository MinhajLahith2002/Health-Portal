package lk.gamage.backend.healthbridgebackend.service.impl;

import lk.gamage.backend.healthbridgebackend.model.RiskScore;
import lk.gamage.backend.healthbridgebackend.model.InsuranceClaim;
import lk.gamage.backend.healthbridgebackend.model.FraudAlert;
import lk.gamage.backend.healthbridgebackend.repository.RiskScoreRepository;
import lk.gamage.backend.healthbridgebackend.repository.InsuranceClaimRepository;
import lk.gamage.backend.healthbridgebackend.repository.FraudAlertRepository;
import lk.gamage.backend.healthbridgebackend.service.RiskScoringService;
import lk.gamage.backend.healthbridgebackend.service.RiskScoreStatistics;
import lk.gamage.backend.healthbridgebackend.service.RiskScoreBreakdown;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RiskScoringServiceImpl implements RiskScoringService {

    private static final Logger log = LoggerFactory.getLogger(RiskScoringServiceImpl.class);
    private static final Set<String> RISK_RELEVANT_ALERT_STATUSES = Set.of(
            "PENDING", "UNDER_REVIEW", "CONFIRMED_FRAUD", "ESCALATED");

    @Autowired
    private RiskScoreRepository riskScoreRepository;

    @Autowired
    private InsuranceClaimRepository claimRepository;

    @Autowired
    private FraudAlertRepository fraudAlertRepository;

    // Risk score thresholds
    private static final Double LOW_RISK_THRESHOLD = 30.0;
    private static final Double MEDIUM_RISK_THRESHOLD = 60.0;
    private static final Double HIGH_RISK_THRESHOLD = 80.0;

    @Override
    public RiskScore calculateClaimRiskScore(String claimId) {
        try {
            InsuranceClaim claim = claimRepository.findById(claimId)
                    .orElseThrow(() -> new RuntimeException("Claim not found"));

            // Check if there are fraud alerts for this claim
            List<FraudAlert> alerts = fraudAlertRepository.findByClaimId(claimId).stream()
                .filter(this::isRiskRelevantAlert)
                .collect(Collectors.toList());

            Double claimRiskScore = 0.0;
            if (!alerts.isEmpty()) {
                claimRiskScore = alerts.stream()
                        .mapToDouble(FraudAlert::getRiskScore)
                        .average()
                        .orElse(0.0);
            }

            return RiskScore.builder()
                    .claimRiskScore(claimRiskScore)
                    .patientId(claim.getPatientId())
                    .doctorId(null)
                    .policyId(claim.getPolicyId())
                    .calculatedAt(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            log.error("Failed to calculate claim risk score claimId={}", claimId, e);
            return null;
        }
    }

    @Override
    public RiskScore calculatePatientRiskScore(String patientId) {
        try {
            // Get patient's claim history
            LocalDateTime lastYear = LocalDateTime.now().minusYears(1);
            List<InsuranceClaim> claims = claimRepository.findByPatientId(patientId).stream()
                .filter(claim -> claim.getSubmittedAt() != null
                    && claim.getSubmittedAt().isAfter(lastYear))
                .collect(Collectors.toList());
            List<FraudAlert> alerts = fraudAlertRepository.findByPatientId(patientId).stream()
                .filter(this::isRiskRelevantAlert)
                .collect(Collectors.toList());

            if (claims.isEmpty()) {
                return null; // No claims, no risk
            }

            // Calculate individual risk components
            Double claimAmountScore = calculateClaimAmountAnomaly(claims);
            Double frequencyScore = calculateFrequencyScore(claims);
            Double documentationScore = calculateDocumentationScore(claims);
            Double flaggedClaimsScore = calculateFlaggedClaimsScore(alerts, claims);

            // Weighted average (25%, 20%, 25%, 30%)
            Double totalRisk = (claimAmountScore * 0.25) +
                    (frequencyScore * 0.20) +
                    (documentationScore * 0.25) +
                    (flaggedClaimsScore * 0.30);

            // Cap at 100
            totalRisk = Math.min(totalRisk, 100.0);

            // Determine trend
            Optional<RiskScore> previousScore = riskScoreRepository.findByPatientId(patientId);
            String riskTrend = "STABLE";
            if (previousScore.isPresent()) {
                if (totalRisk > previousScore.get().getPatientRiskScore()) {
                    riskTrend = "INCREASING";
                } else if (totalRisk < previousScore.get().getPatientRiskScore()) {
                    riskTrend = "DECREASING";
                }
            }

            // Count flagged claims
                Integer flaggedCount = (int) alerts.stream()
                    .map(FraudAlert::getClaimId)
                    .filter(Objects::nonNull)
                    .distinct()
                    .count();

            // Count confirmed fraud
                Integer confirmedFraudCount = (int) alerts.stream()
                    .filter(a -> "CONFIRMED_FRAUD".equals(a.getStatus()))
                    .map(FraudAlert::getClaimId)
                    .filter(Objects::nonNull)
                    .distinct()
                    .count();

            Integer rejectedClaimsLastYear = claimRepository.countByPatientIdAndStatusAndSubmittedAtAfter(
                    patientId,
                    "REJECTED",
                    LocalDateTime.now().minusYears(1)
            );

            return RiskScore.builder()
                    .patientId(patientId)
                    .patientRiskScore(totalRisk)
                    .claimAmountScore(claimAmountScore)
                    .frequencyScore(frequencyScore)
                    .documentationScore(documentationScore)
                    .totalClaimsLastYear(claims.size())
                    .rejectedClaimsLastYear(rejectedClaimsLastYear != null ? rejectedClaimsLastYear : 0)
                    .flaggedClaimsCount(flaggedCount)
                    .confirmedFraudCount(confirmedFraudCount)
                    .riskTrend(riskTrend)
                    .previousRiskScore(previousScore.map(RiskScore::getPatientRiskScore).orElse(null))
                    .isActive(true)
                    .calculatedAt(LocalDateTime.now())
                    .lastUpdated(LocalDateTime.now())
                    .nextCalculationAt(LocalDateTime.now().plusDays(7))
                    .build();

        } catch (Exception e) {
            log.error("Failed to calculate patient risk score patientId={}", patientId, e);
            return null;
        }
    }

    @Override
    public RiskScore getPatientRiskScore(String patientId) {
        try {
            Optional<RiskScore> existingScore = riskScoreRepository.findByPatientId(patientId);

            if (existingScore.isPresent()) {
                RiskScore score = existingScore.get();
                // Recalculate if due for recalculation
                if (score.getNextCalculationAt() != null && 
                    LocalDateTime.now().isAfter(score.getNextCalculationAt())) {
                    return calculatePatientRiskScore(patientId);
                }
                return score;
            }

            // Calculate if doesn't exist
            return calculatePatientRiskScore(patientId);

        } catch (Exception e) {
            log.error("Failed to retrieve patient risk score patientId={}", patientId, e);
            return null;
        }
    }

    @Override
    public RiskScore getPolicyRiskScore(String policyId) {
        try {
            return riskScoreRepository.findByPolicyId(policyId).orElse(null);
        } catch (Exception e) {
            log.error("Failed to retrieve policy risk score policyId={}", policyId, e);
            return null;
        }
    }

    @Override
    public void recalculateAllRiskScores() {
        try {
            // Get all active patients and doctors
            List<InsuranceClaim> allClaims = claimRepository.findAll();

            Set<String> patientIds = allClaims.stream()
                    .map(InsuranceClaim::getPatientId)
                    .collect(Collectors.toSet());

            // Recalculate all patient scores
            patientIds.forEach(patientId -> {
                RiskScore score = calculatePatientRiskScore(patientId);
                if (score != null) {
                    riskScoreRepository.save(score);
                }
            });

            log.info("Recalculated patient risk scores count={}", patientIds.size());

        } catch (Exception e) {
            log.error("Failed to recalculate patient risk scores", e);
        }
    }

    @Override
    public List<RiskScore> getHighRiskPatients() {
        try {
            return riskScoreRepository.findByPatientRiskScoreGreaterThanAndIsActive(MEDIUM_RISK_THRESHOLD, true);
        } catch (Exception e) {
            log.error("Failed to retrieve high-risk patients", e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<RiskScore> getPatientsWithIncreasingRisk() {
        try {
            return riskScoreRepository.findIncreasingSuspiciousPatients();
        } catch (Exception e) {
            log.error("Failed to retrieve increasing-risk patients", e);
            return new ArrayList<>();
        }
    }

    @Override
    public RiskScoreStatistics getRiskScoreStatistics() {
        try {
            Long highRiskPatients = riskScoreRepository.countByPatientRiskScoreGreaterThan(MEDIUM_RISK_THRESHOLD);
            Long totalScores = riskScoreRepository.countByIsActive(true);
            Long increasingTrend = (long) riskScoreRepository.findIncreasingSuspiciousPatients().size();

            return new RiskScoreStatistics(highRiskPatients, totalScores, increasingTrend);

        } catch (Exception e) {
            log.error("Failed to retrieve risk score statistics", e);
            return new RiskScoreStatistics(0L, 0L, 0L);
        }
    }

    @Override
    public void updateAllRiskTrends() {
        try {
            List<RiskScore> allScores = riskScoreRepository.findByIsActive(true);

            allScores.forEach(score -> {
                if (score.getPreviousRiskScore() != null) {
                    Double current = score.getPatientRiskScore();
                    if (current > score.getPreviousRiskScore()) {
                        score.setRiskTrend("INCREASING");
                    } else if (current < score.getPreviousRiskScore()) {
                        score.setRiskTrend("DECREASING");
                    } else {
                        score.setRiskTrend("STABLE");
                    }
                    riskScoreRepository.save(score);
                }
            });

            log.info("Updated risk trends count={}", allScores.size());

        } catch (Exception e) {
            log.error("Failed to update risk trends", e);
        }
    }

    @Override
    public RiskScoreBreakdown getPatientRiskBreakdown(String patientId) {
        try {
            RiskScore score = getPatientRiskScore(patientId);
            if (score == null) {
                return null;
            }

            return new RiskScoreBreakdown(
                    score.getPatientRiskScore(),
                    score.getClaimAmountScore(),
                    score.getFrequencyScore(),
                    score.getDocumentationScore(),
                    score.getFlaggedClaimsCount(),
                    score.getRiskTrend()
            );

        } catch (Exception e) {
            log.error("Failed to retrieve patient risk breakdown patientId={}", patientId, e);
            return null;
        }
    }

    @Override
    public void archiveInactiveScores() {
        try {
            List<RiskScore> inactiveScores = riskScoreRepository.findByIsActive(false);

            inactiveScores.forEach(score -> {
                riskScoreRepository.delete(score);
            });

            log.info("Archived inactive risk scores count={}", inactiveScores.size());

        } catch (Exception e) {
            log.error("Failed to archive inactive risk scores", e);
        }
    }

    // Helper methods
        private Double calculateClaimAmountAnomaly(List<InsuranceClaim> claims) {
        List<Double> amounts = claims.stream()
            .map(InsuranceClaim::getClaimAmount)
            .filter(Objects::nonNull)
            .filter(amount -> amount >= 0)
            .collect(Collectors.toList());
        if (amounts.isEmpty()) return 0.0;

        Double mean = amounts.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        Double stdDev = calculateStdDeviation(amounts, mean);
        Long outliers = amounts.stream()
            .filter(amount -> Math.abs(amount - mean) > 2 * stdDev)
            .count();

        return Math.min((outliers / (double) amounts.size()) * 100, 100.0);
        }

    private Double calculateFrequencyScore(List<InsuranceClaim> claims) {
        if (claims.isEmpty()) return 0.0;

        LocalDateTime lastYear = LocalDateTime.now().minusYears(1);
        Long claimsLastYear = claims.stream()
                .filter(c -> c.getSubmittedAt() != null && c.getSubmittedAt().isAfter(lastYear))
                .count();

        Double averageMonthlyFrequency = claimsLastYear / 12.0;
        Double score = Math.min(averageMonthlyFrequency * 10, 100.0);

        return score;
    }

    private Double calculateDocumentationScore(List<InsuranceClaim> claims) {
        if (claims.isEmpty()) return 0.0;
        Long claimsWithoutDocs = claims.stream()
                .filter(c -> c.getDocumentFileIds() == null || c.getDocumentFileIds().isEmpty())
                .count();

        return Math.min((claimsWithoutDocs / (double) claims.size()) * 100, 100.0);
    }

    private Double calculateFlaggedClaimsScore(List<FraudAlert> alerts, List<InsuranceClaim> claims) {
        if (claims.isEmpty()) return 0.0;

        long distinctFlaggedClaims = alerts.stream()
            .map(FraudAlert::getClaimId)
            .filter(Objects::nonNull)
            .distinct()
            .count();
        Double flaggedPercentage = (distinctFlaggedClaims / (double) claims.size()) * 100;
        return Math.min(flaggedPercentage, 100.0);
    }

    private Double calculateDoctorClaimAmountAnomaly(List<InsuranceClaim> claims) {
        if (claims.isEmpty()) return 0.0;

        Double mean = claims.stream().mapToDouble(InsuranceClaim::getClaimAmount).average().orElse(0.0);
        Double stdDev = calculateStdDeviation(
                claims.stream().map(InsuranceClaim::getClaimAmount).collect(Collectors.toList()),
                mean
        );

        Long outliers = claims.stream()
                .filter(c -> Math.abs(c.getClaimAmount() - mean) > 2 * stdDev)
                .count();

        return Math.min((outliers / (double) claims.size()) * 50, 100.0);
    }

    private Double calculateStdDeviation(List<Double> values, Double mean) {
        if (values.isEmpty()) return 0.0;

        Double variance = values.stream()
                .mapToDouble(v -> Math.pow(v - mean, 2))
                .average()
                .orElse(0.0);

        return Math.sqrt(variance);
    }
    private boolean isRiskRelevantAlert(FraudAlert alert) {
        return alert != null && RISK_RELEVANT_ALERT_STATUSES.contains(alert.getStatus());
    }
}
