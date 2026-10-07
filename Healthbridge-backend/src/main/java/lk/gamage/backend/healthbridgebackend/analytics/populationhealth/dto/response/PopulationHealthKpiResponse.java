package lk.gamage.backend.healthbridgebackend.analytics.populationhealth.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

public record PopulationHealthKpiResponse(
        String name,
        Long value,
        DataAvailability status,
        String definition,
        String reason
) {
}
