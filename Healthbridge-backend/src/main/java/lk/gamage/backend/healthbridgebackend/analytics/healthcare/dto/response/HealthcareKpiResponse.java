package lk.gamage.backend.healthbridgebackend.analytics.healthcare.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

public record HealthcareKpiResponse(
        String name,
        Long value,
        DataAvailability status,
        String definition,
        String reason
) {
}
