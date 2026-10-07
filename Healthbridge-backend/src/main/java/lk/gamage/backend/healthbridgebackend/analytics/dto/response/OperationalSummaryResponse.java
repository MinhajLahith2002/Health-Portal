package lk.gamage.backend.healthbridgebackend.analytics.dto.response;

public record OperationalSummaryResponse(
        String department,
        long patients,
        long appointments,
        int utilization,
        long revenue,
        String status
) {
}
