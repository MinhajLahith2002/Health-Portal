package lk.gamage.backend.healthbridgebackend.analytics.operational.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

public record ResourceAvailabilityResponse(
        String resource,
        DataAvailability status,
        Long workloadCount,
        String workloadUnit,
        String reason,
        String definition
) {
}
