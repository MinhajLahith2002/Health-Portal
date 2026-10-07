package lk.gamage.backend.healthbridgebackend.analytics.reports.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

public record ReportAvailabilityResponse(
        String feature,
        DataAvailability status,
        String reason
) {
}
