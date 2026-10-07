package lk.gamage.backend.healthbridgebackend.analytics.healthcare.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

import java.util.List;

public record DemographicDistributionResponse(
        DataAvailability status,
        List<Bucket> distribution,
        long totalPatientAccounts,
        long validRecords,
        long excludedRecords,
        String note
) {
    public record Bucket(String label, long count) {
    }
}
