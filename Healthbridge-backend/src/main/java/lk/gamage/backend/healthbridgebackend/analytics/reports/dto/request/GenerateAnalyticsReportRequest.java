package lk.gamage.backend.healthbridgebackend.analytics.reports.dto.request;

public record GenerateAnalyticsReportRequest(
        AnalyticsReportType reportType,
        String period
) {
}
