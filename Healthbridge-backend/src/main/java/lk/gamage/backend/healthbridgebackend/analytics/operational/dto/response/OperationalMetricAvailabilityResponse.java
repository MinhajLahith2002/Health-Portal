package lk.gamage.backend.healthbridgebackend.analytics.operational.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

public record OperationalMetricAvailabilityResponse(
        String metric,
        DataAvailability status,
        String reason,
        String definition
) {
}
