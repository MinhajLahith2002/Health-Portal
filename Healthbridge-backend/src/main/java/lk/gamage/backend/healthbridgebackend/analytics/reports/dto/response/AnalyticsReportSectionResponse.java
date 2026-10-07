package lk.gamage.backend.healthbridgebackend.analytics.reports.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

import java.util.List;

public record AnalyticsReportSectionResponse(
        String title,
        DataAvailability dataAvailability,
        String description,
        List<AnalyticsReportMetricResponse> metrics
) {
}
