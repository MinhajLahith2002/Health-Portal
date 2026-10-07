package lk.gamage.backend.healthbridgebackend.analytics.reports.dto.response;

import java.time.Instant;

public record ReportSummaryDTO(
        String reportId,
        String title,
        String category,
        String reportType,
        String status,
        Instant generatedDate,
        String format
) {
}
