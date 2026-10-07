package lk.gamage.backend.healthbridgebackend.analytics.reports.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

public record AnalyticsReportMetricResponse(
        String name,
        String value,
        String unit,
        DataAvailability status,
        String definition,
        String reason
) {
}
