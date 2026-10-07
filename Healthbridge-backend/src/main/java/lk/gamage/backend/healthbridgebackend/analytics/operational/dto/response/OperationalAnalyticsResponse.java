package lk.gamage.backend.healthbridgebackend.analytics.operational.dto.response;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;

import java.time.Instant;
import java.util.List;

public record OperationalAnalyticsResponse(
        Instant generatedAt,
        String period,
        DataAvailability dataAvailability,
        List<OperationalKpiResponse> kpis,
        InventoryUtilizationResponse inventorySummary,
        LaboratoryOperationalResponse laboratoryOperations,
        LabTurnaroundResponse labTurnaround,
        List<ResourceAvailabilityResponse> resourceAvailability,
        OperationalMetricAvailabilityResponse patientFlow,
        OperationalMetricAvailabilityResponse appointmentEfficiency,
        OperationalMetricAvailabilityResponse departmentPerformance,
        OperationalSummaryResponse operationalSummary,
        List<OperationalMetricAvailabilityResponse> availability
) {
}
