package lk.gamage.backend.healthbridgebackend.mapper;

import lk.gamage.backend.healthbridgebackend.dto.response.*;
import lk.gamage.backend.healthbridgebackend.model.FraudAlert;
import lk.gamage.backend.healthbridgebackend.model.RiskScore;
import lk.gamage.backend.healthbridgebackend.service.FraudAlertStatistics;
import lk.gamage.backend.healthbridgebackend.service.RiskScoreStatistics;
import lk.gamage.backend.healthbridgebackend.service.RiskScoreBreakdown;
import org.springframework.stereotype.Component;

@Component
public class FraudMapper {

    /**
     * Convert FraudAlert entity to FraudAlertResponse DTO
     */
    public FraudAlertResponse toFraudAlertResponse(FraudAlert fraudAlert) {
        if (fraudAlert == null) {
            return null;
        }

        return FraudAlertResponse.builder()
                .id(fraudAlert.getId())
                .claimId(fraudAlert.getClaimId())
                .patientId(fraudAlert.getPatientId())
                .policyId(fraudAlert.getPolicyId())
                .doctorId(fraudAlert.getDoctorId())
                .alertType(fraudAlert.getAlertType())
                .description(fraudAlert.getDescription())
                .severity(fraudAlert.getSeverity())
                .riskScore(fraudAlert.getRiskScore())
                .riskFactors(fraudAlert.getRiskFactors())
                .status(fraudAlert.getStatus())
                .reviewedByOfficerId(fraudAlert.getReviewedByOfficerId())
                .reviewNotes(fraudAlert.getReviewNotes())
                .createdAt(fraudAlert.getCreatedAt())
                .reviewedAt(fraudAlert.getReviewedAt())
                .updatedAt(fraudAlert.getUpdatedAt())
                .build();
    }

    /**
     * Convert RiskScore entity to RiskScoreResponse DTO
     */
    public RiskScoreResponse toRiskScoreResponse(RiskScore riskScore) {
        if (riskScore == null) {
            return null;
        }

        return RiskScoreResponse.builder()
                .id(riskScore.getId())
                .patientId(riskScore.getPatientId())
                .doctorId(riskScore.getDoctorId())
                .policyId(riskScore.getPolicyId())
                .patientRiskScore(riskScore.getPatientRiskScore())
                .claimRiskScore(riskScore.getClaimRiskScore())
                .claimAmountScore(riskScore.getClaimAmountScore())
                .frequencyScore(riskScore.getFrequencyScore())
                .doctorReputationScore(riskScore.getDoctorReputationScore())
                .documentationScore(riskScore.getDocumentationScore())
                .medicalLogicScore(riskScore.getMedicalLogicScore())
                .totalClaimsLastYear(riskScore.getTotalClaimsLastYear())
                .rejectedClaimsLastYear(riskScore.getRejectedClaimsLastYear())
                .averageClaimAmountLastYear(riskScore.getAverageClaimAmountLastYear())
                .flaggedClaimsCount(riskScore.getFlaggedClaimsCount())
                .confirmedFraudCount(riskScore.getConfirmedFraudCount())
                .riskTrend(riskScore.getRiskTrend())
                .notes(riskScore.getNotes())
                .calculatedAt(riskScore.getCalculatedAt())
                .lastUpdated(riskScore.getLastUpdated())
                .build();
    }

    /**
     * Convert FraudAlertStatistics to FraudAlertStatisticsResponse DTO
     */
    public FraudAlertStatisticsResponse toFraudAlertStatisticsResponse(FraudAlertStatistics statistics) {
        if (statistics == null) {
            return null;
        }

        return FraudAlertStatisticsResponse.builder()
                .totalAlerts(statistics.getTotalAlerts())
                .pendingAlerts(statistics.getPendingAlerts())
                .confirmedFraudAlerts(statistics.getConfirmedFraudAlerts())
                .falsePositiveAlerts(statistics.getFalsePositiveAlerts())
                .criticalSeverityAlerts(statistics.getCriticalSeverityAlerts())
                .pendingPercentage(statistics.getPendingPercentage())
                .confirmedFraudPercentage(statistics.getConfirmedFraudPercentage())
                .falsePositivePercentage(statistics.getFalsePositivePercentage())
                .build();
    }

    /**
     * Convert RiskScoreStatistics to RiskScoreStatisticsResponse DTO
     */
    public RiskScoreStatisticsResponse toRiskScoreStatisticsResponse(RiskScoreStatistics statistics) {
        if (statistics == null) {
            return null;
        }

        return RiskScoreStatisticsResponse.builder()
                .highRiskPatients(statistics.getHighRiskPatients())
                .totalActiveScores(statistics.getTotalActiveScores())
                .patientsWithIncreasingRisk(statistics.getPatientsWithIncreasingRisk())
                .highRiskPercentage(statistics.getHighRiskPercentage())
                .totalHighRiskEntities(statistics.getTotalHighRiskEntities())
                .build();
    }

    /**
     * Convert RiskScoreBreakdown to RiskScoreBreakdownResponse DTO
     */
    public RiskScoreBreakdownResponse toRiskScoreBreakdownResponse(RiskScoreBreakdown breakdown) {
        if (breakdown == null) {
            return null;
        }

        return RiskScoreBreakdownResponse.builder()
                .overallRiskScore(breakdown.getOverallRiskScore())
                .claimAmountScore(breakdown.getClaimAmountScore())
                .frequencyScore(breakdown.getFrequencyScore())
                .documentationScore(breakdown.getDocumentationScore())
                .flaggedClaimsCount(breakdown.getFlaggedClaimsCount())
                .riskTrend(breakdown.getRiskTrend())
                .riskLevel(breakdown.getRiskLevel())
                .build();
    }
}
