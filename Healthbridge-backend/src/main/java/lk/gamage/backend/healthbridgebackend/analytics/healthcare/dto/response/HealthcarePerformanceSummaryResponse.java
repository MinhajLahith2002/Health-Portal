package lk.gamage.backend.healthbridgebackend.analytics.healthcare.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

public record HealthcarePerformanceSummaryResponse(
        DataAvailability status,
        long registeredPatientAccounts,
        long newRegisteredPatientAccounts,
        long laboratoryTestOrders,
        HealthcareMetricAvailabilityResponse departmentPerformance
) {
}
