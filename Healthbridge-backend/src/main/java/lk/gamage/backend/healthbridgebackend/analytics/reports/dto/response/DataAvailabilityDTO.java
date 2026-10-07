package lk.gamage.backend.healthbridgebackend.analytics.reports.dto.response;

public record DataAvailabilityDTO(
        String dataSource,
        String status,
        String reason
) {
}
