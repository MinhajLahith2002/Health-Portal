package lk.gamage.backend.healthbridgebackend.analytics.healthcare.dto.response;

public record PatientGrowthResponse(
        String periodLabel,
        long newPatients,
        long totalPatients
) {
}
