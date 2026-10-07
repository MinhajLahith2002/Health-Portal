package lk.gamage.backend.healthbridgebackend.analytics.financial.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

public record FinancialMetricAvailabilityResponse(
        String metric,
        DataAvailability status,
        String reason,
        String definition
) {
}
