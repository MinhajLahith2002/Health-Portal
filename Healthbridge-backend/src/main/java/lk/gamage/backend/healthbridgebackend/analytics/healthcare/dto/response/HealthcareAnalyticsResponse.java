package lk.gamage.backend.healthbridgebackend.analytics.healthcare.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

import java.time.Instant;
import java.util.List;

public record HealthcareAnalyticsResponse(
        Instant generatedAt,
        String period,
        DataAvailability dataAvailability,
        List<HealthcareKpiResponse> kpis,
        List<PatientGrowthResponse> patientGrowth,
        LaboratoryActivityResponse laboratoryActivity,
        DemographicDistributionResponse ageDistribution,
        DemographicDistributionResponse genderDistribution,
        ClinicalActivityResponse clinicalActivity,
        HealthcareMetricAvailabilityResponse appointmentAnalytics,
        HealthcareMetricAvailabilityResponse departmentActivity,
        HealthcarePerformanceSummaryResponse performanceSummary,
        List<HealthcareMetricAvailabilityResponse> availability
) {
}
