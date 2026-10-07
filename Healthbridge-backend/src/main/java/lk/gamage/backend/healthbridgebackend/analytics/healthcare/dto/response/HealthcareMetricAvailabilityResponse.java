package lk.gamage.backend.healthbridgebackend.analytics.healthcare.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

public record HealthcareMetricAvailabilityResponse(
        String metric,
        DataAvailability status,
        String reason,
        String definition
) {
}
