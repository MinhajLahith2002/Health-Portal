package lk.gamage.backend.healthbridgebackend.analytics.populationhealth.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

public record PopulationMetricAvailabilityResponse(
        String metric,
        DataAvailability status,
        String reason,
        String definition
) {
}
