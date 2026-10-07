package lk.gamage.backend.healthbridgebackend.analytics.populationhealth.dto.response;

public record PopulationGrowthResponse(
        String periodLabel,
        long newPatientAccounts,
        long totalPatientAccounts
) {
}
