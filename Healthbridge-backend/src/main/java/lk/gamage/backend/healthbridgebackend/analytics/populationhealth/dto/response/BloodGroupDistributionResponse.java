package lk.gamage.backend.healthbridgebackend.analytics.populationhealth.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

import java.util.List;

public record BloodGroupDistributionResponse(
        DataAvailability status,
        List<Bucket> distribution,
        long totalPatientAccounts,
        long validRecords,
        long unknownRecords,
        String note
) {
    public record Bucket(String bloodGroup, long count) {
    }
}
