package lk.gamage.backend.healthbridgebackend.analytics.reports.dto.response;

public record ReportActivityDTO(
        String date,
        Long generatedReports,
        Long exportedReports
) {
}
