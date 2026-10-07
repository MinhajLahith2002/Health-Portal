package lk.gamage.backend.healthbridgebackend.analytics.reports.dto.response;

public record AnalyticsKpiDTO(
        String label,
        Long value,
        String reason
) {
}
