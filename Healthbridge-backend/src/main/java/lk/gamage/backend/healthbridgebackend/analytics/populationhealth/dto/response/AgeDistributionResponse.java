package lk.gamage.backend.healthbridgebackend.analytics.populationhealth.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

import java.util.List;

public record AgeDistributionResponse(
        DataAvailability status,
        List<Bucket> distribution,
        long totalPatientAccounts,
        long validRecords,
        long excludedRecords,
        String note
) {
    public record Bucket(String ageGroup, long count) {
    }
}
