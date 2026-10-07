package lk.gamage.backend.healthbridgebackend.analytics.healthcare.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

public record ClinicalActivityResponse(
        DataAvailability status,
        LaboratoryActivityResponse laboratory,
        HealthcareMetricAvailabilityResponse consultations,
        HealthcareMetricAvailabilityResponse prescriptions,
        HealthcareMetricAvailabilityResponse telemedicine
) {
}
