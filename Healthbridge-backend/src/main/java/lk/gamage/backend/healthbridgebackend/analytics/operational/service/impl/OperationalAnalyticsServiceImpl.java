package lk.gamage.backend.healthbridgebackend.analytics.operational.service.impl;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;
import lk.gamage.backend.healthbridgebackend.analytics.operational.dto.response.*;
import lk.gamage.backend.healthbridgebackend.analytics.operational.repository.OperationalAnalyticsReadRepository;
import lk.gamage.backend.healthbridgebackend.analytics.operational.service.OperationalAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OperationalAnalyticsServiceImpl implements OperationalAnalyticsService {

    private static final Set<String> SUPPORTED_PERIODS = Set.of("today", "week", "month", "year");
    private static final String LAB_ORDER_DEFINITION = "Counts LabTest order documents by requestedAt, not individual assays.";

    private final OperationalAnalyticsReadRepository repository;

    @Override
    public OperationalAnalyticsResponse getOperationalAnalytics(String requestedPeriod) {
        String period = normalizePeriod(requestedPeriod);
        ZoneId zone = ZoneId.systemDefault();
        ZonedDateTime now = ZonedDateTime.now(zone);
        PeriodWindow window = periodWindow(period, now);

        OperationalAnalyticsReadRepository.InventoryData inventory = repository.summarizeInventory();
        OperationalAnalyticsReadRepository.LabOrderData lab = repository.summarizeLabOrders(window.start(), window.end());
        Map<String, Long> sampleStatuses = repository.countLinkedSampleStatuses(window.start(), window.end());

        long completed = count(lab.statusCounts(), "COMPLETED");
        long cancelled = count(lab.statusCounts(), "CANCELLED");
        long eligible = Math.max(0, lab.totalOrders() - cancelled);
        BigDecimal completionRate = percentage(completed, eligible);

        OperationalAnalyticsReadRepository.TurnaroundData turnaround =
                repository.calculatePublishedResultTurnaround(window.start(), window.end());
        long turnaroundExcluded = Math.max(0, eligible - turnaround.validRecords());

        InventoryUtilizationResponse inventoryResponse = inventoryResponse(inventory);
        LaboratoryOperationalResponse laboratoryResponse = laboratoryResponse(
                lab, sampleStatuses, eligible, completed, completionRate);
        LabTurnaroundResponse turnaroundResponse = new LabTurnaroundResponse(
                DataAvailability.PARTIAL,
                turnaround.averageHours().setScale(2, RoundingMode.HALF_UP),
                eligible,
                turnaround.validRecords(),
                turnaroundExcluded,
                "Average hours from LabTest.requestedAt to the earliest linked LabResult.publishedAt for non-cancelled orders; "
                        + "orders without valid linked timestamps are excluded."
        );

        OperationalMetricAvailabilityResponse patientFlow = unavailable(
                "Patient Flow", "Admission, discharge, and emergency workflow persistence is not implemented.");
        OperationalMetricAvailabilityResponse appointments = unavailable(
                "Appointment Efficiency", "Appointment persistence is not implemented.");
        OperationalMetricAvailabilityResponse departments = unavailable(
                "Department Operational Performance", "Department persistence and operational relationships are not implemented.");

        return new OperationalAnalyticsResponse(
                Instant.now(),
                period,
                DataAvailability.PARTIAL,
                kpis(inventory, lab, completionRate),
                inventoryResponse,
                laboratoryResponse,
                turnaroundResponse,
                resources(lab.totalOrders()),
                patientFlow,
                appointments,
                departments,
                new OperationalSummaryResponse(
                        DataAvailability.PARTIAL,
                        inventory.totalItems(),
                        count(inventory.statusCounts(), "LOW_STOCK"),
                        count(inventory.statusCounts(), "OUT_OF_STOCK"),
                        lab.totalOrders(),
                        completionRate,
                        turnaroundResponse.averageHours(),
                        turnaround.validRecords(),
                        departments
                ),
                availability(patientFlow, appointments, departments)
        );
    }

    private InventoryUtilizationResponse inventoryResponse(OperationalAnalyticsReadRepository.InventoryData inventory) {
        return new InventoryUtilizationResponse(
                inventory.validValueRecords() == inventory.totalItems() ? DataAvailability.LIVE : DataAvailability.PARTIAL,
                inventory.totalItems(),
                List.of("IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "EXPIRED").stream()
                        .map(status -> new InventoryStatusResponse(status, count(inventory.statusCounts(), status)))
                        .toList(),
                inventory.inventoryValue(),
                inventory.validValueRecords(),
                Math.max(0, inventory.totalItems() - inventory.validValueRecords()),
                "Inventory value is the sum of quantity × unitCost for records where both fields are numeric; persisted status values are used unchanged."
        );
    }

    private LaboratoryOperationalResponse laboratoryResponse(
            OperationalAnalyticsReadRepository.LabOrderData lab,
            Map<String, Long> samples,
            long eligible,
            long completed,
            BigDecimal completionRate
    ) {
        List<LaboratoryOperationalResponse.StatusCount> orderStatuses =
                List.of("REQUESTED", "SAMPLE_COLLECTED", "PROCESSING", "COMPLETED", "CANCELLED").stream()
                        .map(status -> new LaboratoryOperationalResponse.StatusCount(status, count(lab.statusCounts(), status)))
                        .toList();
        List<LaboratoryOperationalResponse.StatusCount> sampleStatus =
                List.of("PENDING", "COLLECTED", "IN_TRANSIT", "RECEIVED", "REJECTED").stream()
                        .map(status -> new LaboratoryOperationalResponse.StatusCount(status, count(samples, status)))
                        .toList();
        long linkedSamples = samples.values().stream().mapToLong(Long::longValue).sum();
        return new LaboratoryOperationalResponse(
                DataAvailability.PARTIAL,
                lab.totalOrders(),
                eligible,
                completed,
                completionRate,
                orderStatuses,
                sampleStatus,
                linkedSamples,
                LAB_ORDER_DEFINITION + " Completion rate is COMPLETED / all non-cancelled orders × 100.",
                "Counts LabSample records linked by testOrderId to LabTest orders requested in the selected period."
        );
    }

    private List<OperationalKpiResponse> kpis(
            OperationalAnalyticsReadRepository.InventoryData inventory,
            OperationalAnalyticsReadRepository.LabOrderData lab,
            BigDecimal completionRate
    ) {
        return List.of(
                numericKpi("Inventory Items", inventory.totalItems(), "items", DataAvailability.LIVE,
                        "Count of real hospital_inventory documents."),
                numericKpi("Low Stock Items", count(inventory.statusCounts(), "LOW_STOCK"), "items", DataAvailability.LIVE,
                        "Count where persisted status is LOW_STOCK."),
                numericKpi("Out of Stock Items", count(inventory.statusCounts(), "OUT_OF_STOCK"), "items", DataAvailability.LIVE,
                        "Count where persisted status is OUT_OF_STOCK."),
                new OperationalKpiResponse("Inventory Value", inventory.inventoryValue(), "currency units",
                        inventory.validValueRecords() == inventory.totalItems() ? DataAvailability.LIVE : DataAvailability.PARTIAL,
                        "Sum of quantity × unitCost for records with both numeric fields.",
                        inventory.validValueRecords() == inventory.totalItems() ? null : "Some inventory records lack usable quantity or unitCost."),
                numericKpi("Lab Test Orders", lab.totalOrders(), "orders", DataAvailability.PARTIAL, LAB_ORDER_DEFINITION),
                new OperationalKpiResponse("Lab Completion Rate", completionRate, "percent", DataAvailability.LIVE,
                        "COMPLETED orders divided by all non-cancelled orders requested in the selected period × 100.", null),
                unavailableKpi("Bed Occupancy", "Bed/ward capacity persistence is not implemented."),
                unavailableKpi("Staff Utilization", "Staff scheduling/utilization persistence is not implemented."),
                unavailableKpi("Equipment Utilization", "Equipment utilization tracking is not implemented."),
                unavailableKpi("Average Wait Time", "Appointment and patient-flow persistence is not implemented."),
                unavailableKpi("Appointment Completion", "Appointment persistence is not implemented.")
        );
    }

    private List<ResourceAvailabilityResponse> resources(long labOrders) {
        return List.of(
                unavailableResource("Beds", "Bed/ward capacity persistence is not implemented."),
                unavailableResource("Staff", "Staff scheduling/utilization persistence is not implemented."),
                unavailableResource("Equipment", "Equipment utilization tracking is not implemented."),
                new ResourceAvailabilityResponse(
                        "Laboratory", DataAvailability.PARTIAL, labOrders, "test orders", null,
                        "Real laboratory workload count for the selected period; this is not percentage utilization because capacity is unavailable.")
        );
    }

    private List<OperationalMetricAvailabilityResponse> availability(
            OperationalMetricAvailabilityResponse patientFlow,
            OperationalMetricAvailabilityResponse appointments,
            OperationalMetricAvailabilityResponse departments
    ) {
        return List.of(
                live("Inventory Items", "Counts real hospital_inventory documents and persisted statuses."),
                partial("Inventory Value", "Coverage depends on numeric quantity and unitCost fields."),
                partial("Laboratory Workload", LAB_ORDER_DEFINITION),
                live("Laboratory Completion Rate", "COMPLETED / non-cancelled orders × 100."),
                partial("Laboratory Turnaround", "Requires linked LabResult.publishedAt timestamps."),
                unavailable("Bed Occupancy", "Bed/ward capacity persistence is not implemented."),
                unavailable("Staff Utilization", "Staff scheduling/utilization persistence is not implemented."),
                unavailable("Equipment Utilization", "Equipment utilization tracking is not implemented."),
                unavailable("Average Wait Time", "Appointment and patient-flow persistence is not implemented."),
                patientFlow,
                appointments,
                departments
        );
    }

    private BigDecimal percentage(long numerator, long denominator) {
        if (denominator == 0) return BigDecimal.ZERO.setScale(2);
        return BigDecimal.valueOf(numerator)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(denominator), 2, RoundingMode.HALF_UP);
    }

    private long count(Map<String, Long> counts, String key) {
        return counts.getOrDefault(key, 0L);
    }

    private String normalizePeriod(String requestedPeriod) {
        String period = requestedPeriod == null ? "month" : requestedPeriod.trim().toLowerCase(Locale.ROOT);
        if (!SUPPORTED_PERIODS.contains(period)) {
            throw new IllegalArgumentException(
                    "Invalid period '" + requestedPeriod + "'. Supported values: today, week, month, year");
        }
        return period;
    }

    private PeriodWindow periodWindow(String period, ZonedDateTime now) {
        LocalDate today = now.toLocalDate();
        ZonedDateTime start = switch (period) {
            case "today" -> today.atStartOfDay(now.getZone());
            case "week" -> today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay(now.getZone());
            case "year" -> today.withDayOfYear(1).atStartOfDay(now.getZone());
            default -> today.withDayOfMonth(1).atStartOfDay(now.getZone());
        };
        return new PeriodWindow(start.toInstant(), now.plusNanos(1).toInstant());
    }

    private OperationalKpiResponse numericKpi(
            String name, long value, String unit, DataAvailability status, String definition) {
        return new OperationalKpiResponse(name, BigDecimal.valueOf(value), unit, status, definition, null);
    }

    private OperationalKpiResponse unavailableKpi(String name, String reason) {
        return new OperationalKpiResponse(name, null, null, DataAvailability.UNAVAILABLE, null, reason);
    }

    private ResourceAvailabilityResponse unavailableResource(String resource, String reason) {
        return new ResourceAvailabilityResponse(resource, DataAvailability.UNAVAILABLE, null, null, reason, null);
    }

    private OperationalMetricAvailabilityResponse live(String metric, String definition) {
        return new OperationalMetricAvailabilityResponse(metric, DataAvailability.LIVE, null, definition);
    }

    private OperationalMetricAvailabilityResponse partial(String metric, String reason) {
        return new OperationalMetricAvailabilityResponse(metric, DataAvailability.PARTIAL, reason, null);
    }

    private OperationalMetricAvailabilityResponse unavailable(String metric, String reason) {
        return new OperationalMetricAvailabilityResponse(metric, DataAvailability.UNAVAILABLE, reason, null);
    }

    private record PeriodWindow(Instant start, Instant end) {
    }
}
