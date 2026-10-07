package lk.gamage.backend.healthbridgebackend.analytics.populationhealth.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

import java.time.Instant;
import java.util.List;

public record PopulationHealthAnalyticsResponse(
        Instant generatedAt,
        String period,
        DataAvailability dataAvailability,
        List<PopulationHealthKpiResponse> kpis,
        List<PopulationGrowthResponse> populationGrowth,
        AgeDistributionResponse ageDistribution,
        GenderDistributionResponse genderDistribution,
        BloodGroupDistributionResponse bloodGroupDistribution,
        LabHealthIndicatorResponse labHealthIndicators,
        PopulationMetricAvailabilityResponse commonConditions,
        PopulationMetricAvailabilityResponse healthRisk,
        PopulationMetricAvailabilityResponse healthcareUtilizationByAge,
        PopulationMetricAvailabilityResponse regionalPatterns,
        PopulationMetricAvailabilityResponse preventiveCare,
        PopulationHealthSummaryResponse populationHealthSummary,
        List<PopulationMetricAvailabilityResponse> availability
) {
}
