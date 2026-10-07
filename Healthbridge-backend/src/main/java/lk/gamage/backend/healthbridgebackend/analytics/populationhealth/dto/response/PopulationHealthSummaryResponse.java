package lk.gamage.backend.healthbridgebackend.analytics.populationhealth.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

public record PopulationHealthSummaryResponse(
        DataAvailability status,
        long registeredPatientAccounts,
        long newPatientAccounts,
        long validAgeRecords,
        long validGenderRecords,
        long validBloodGroupRecords,
        long publishedLabResults,
        long abnormalLabResults,
        long criticalLabResults,
        String limitation
) {
}
