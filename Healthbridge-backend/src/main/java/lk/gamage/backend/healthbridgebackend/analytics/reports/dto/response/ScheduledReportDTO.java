package lk.gamage.backend.healthbridgebackend.analytics.reports.dto.response;

import java.time.Instant;

public record ScheduledReportDTO(
        String name,
        String frequency,
        Instant nextRun,
        String status
) {
}
