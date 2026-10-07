package lk.gamage.backend.healthbridgebackend.analytics.reports.service.impl;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;
import lk.gamage.backend.healthbridgebackend.analytics.financial.dto.response.*;
import lk.gamage.backend.healthbridgebackend.analytics.financial.service.FinancialAnalyticsService;
import lk.gamage.backend.healthbridgebackend.analytics.healthcare.dto.response.HealthcareAnalyticsResponse;
import lk.gamage.backend.healthbridgebackend.analytics.healthcare.dto.response.HealthcareKpiResponse;
import lk.gamage.backend.healthbridgebackend.analytics.healthcare.service.HealthcareAnalyticsService;
import lk.gamage.backend.healthbridgebackend.analytics.operational.dto.response.*;
import lk.gamage.backend.healthbridgebackend.analytics.operational.service.OperationalAnalyticsService;
import lk.gamage.backend.healthbridgebackend.analytics.populationhealth.dto.response.*;
import lk.gamage.backend.healthbridgebackend.analytics.populationhealth.service.PopulationHealthAnalyticsService;
import lk.gamage.backend.healthbridgebackend.analytics.reports.dto.request.AnalyticsReportType;
import lk.gamage.backend.healthbridgebackend.analytics.reports.dto.request.GenerateAnalyticsReportRequest;
import lk.gamage.backend.healthbridgebackend.analytics.reports.dto.response.*;
import lk.gamage.backend.healthbridgebackend.analytics.reports.service.AnalyticsReportsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsReportsServiceImpl implements AnalyticsReportsService {

    private static final Set<String> SUPPORTED_PERIODS = Set.of("today", "week", "month", "year");
    private static final String EXPORT_REASON = "File export service is not implemented.";

    private final HealthcareAnalyticsService healthcareAnalyticsService;
    private final FinancialAnalyticsService financialAnalyticsService;
    private final OperationalAnalyticsService operationalAnalyticsService;
    private final PopulationHealthAnalyticsService populationHealthAnalyticsService;

    @Override
    public AnalyticsReportResponse generatePreview(GenerateAnalyticsReportRequest request) {
        if (request == null || request.reportType() == null) {
            throw new IllegalArgumentException("reportType is required. Supported values: "
                    + String.join(", ", Arrays.stream(AnalyticsReportType.values()).map(Enum::name).toList()));
        }
        String period = normalizePeriod(request.period());
        ReportContent content = switch (request.reportType()) {
            case HEALTHCARE -> healthcareReport(period);
            case FINANCIAL -> financialReport(period);
            case OPERATIONAL -> operationalReport(period);
            case POPULATION_HEALTH -> populationHealthReport(period);
            case EXECUTIVE_SUMMARY -> executiveSummary(period);
        };
        return new AnalyticsReportResponse(
                UUID.randomUUID().toString(),
                Instant.now(),
                request.reportType(),
                period,
                content.availability(),
                content.title(),
                content.summary(),
                content.sections(),
                unavailableExports(),
                false
        );
    }

    @Override
    public AnalyticsReportCapabilitiesResponse getCapabilities() {
        return new AnalyticsReportCapabilitiesResponse(
                List.of(AnalyticsReportType.values()),
                List.of("today", "week", "month", "year"),
                available("Preview Generation"),
                unavailable("PDF Export", EXPORT_REASON),
                unavailable("Excel Export", EXPORT_REASON),
                unavailable("Recent Report Persistence", "Persistent report storage is not implemented."),
                unavailable("Scheduled Reports", "Report scheduling and persistent report storage are not implemented.")
        );
    }

    @Override
    public ReportsAnalyticsResponseDTO getReportsAnalytics(String requestedPeriod) {
        String period = normalizePeriod(requestedPeriod);
        String persistenceReason = "Report persistence is not implemented.";
        String schedulingReason = "Report scheduling and persistent report storage are not implemented.";
        String activityReason = "Report activity persistence is not implemented.";
        String categoryReason = "Report category distribution persistence is not implemented.";

        return new ReportsAnalyticsResponseDTO(
                Instant.now(),
                period,
                DataAvailability.PARTIAL,
                List.of(
                        new AnalyticsKpiDTO("Reports Generated", null, persistenceReason),
                        new AnalyticsKpiDTO("Scheduled Reports", null, schedulingReason),
                        new AnalyticsKpiDTO("Reports This Period", null, persistenceReason),
                        new AnalyticsKpiDTO("Pending Reports", null, persistenceReason)
                ),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(
                        new DataAvailabilityDTO("Reports", DataAvailability.PARTIAL.name(), persistenceReason),
                        new DataAvailabilityDTO("Report Activity", DataAvailability.UNAVAILABLE.name(), activityReason),
                        new DataAvailabilityDTO("Category Distribution", DataAvailability.UNAVAILABLE.name(), categoryReason),
                        new DataAvailabilityDTO("Scheduled Reports", DataAvailability.UNAVAILABLE.name(), schedulingReason),
                        new DataAvailabilityDTO("PDF Export", DataAvailability.UNAVAILABLE.name(), EXPORT_REASON),
                        new DataAvailabilityDTO("Excel Export", DataAvailability.UNAVAILABLE.name(), EXPORT_REASON)
                )
        );
    }

    private ReportContent healthcareReport(String period) {
        HealthcareAnalyticsResponse source = healthcareAnalyticsService.getHealthcareAnalytics(period);
        List<AnalyticsReportSectionResponse> sections = List.of(
                section("Healthcare KPIs", source.dataAvailability(),
                        "Healthcare metrics retain the source endpoint's availability and limitations.",
                        source.kpis().stream().map(this::healthcareMetric).toList()),
                section("Laboratory Activity", source.laboratoryActivity().status(),
                        source.laboratoryActivity().definition(),
                        List.of(
                                countMetric("Laboratory Test Orders", source.laboratoryActivity().totalOrders(), source.laboratoryActivity().status(), source.laboratoryActivity().definition()),
                                countMetric("Completed Orders", source.laboratoryActivity().completed(), source.laboratoryActivity().status(), "Completed LabTest orders."),
                                countMetric("Cancelled Orders", source.laboratoryActivity().cancelled(), source.laboratoryActivity().status(), "Cancelled LabTest orders.")
                        )),
                section("Demographic Coverage", DataAvailability.PARTIAL,
                        "Demographics use optional, free-form patient-account fields.",
                        List.of(
                                coverageMetric("Valid DOB Records", source.ageDistribution().validRecords(), source.ageDistribution().totalPatientAccounts()),
                                coverageMetric("Valid Gender Records", source.genderDistribution().validRecords(), source.genderDistribution().totalPatientAccounts())
                        ))
        );
        return new ReportContent("Healthcare Analytics Report",
                "Snapshot of registered patient-account and laboratory analytics. Unimplemented clinical domains remain unavailable.",
                source.dataAvailability(), sections);
    }

    private ReportContent financialReport(String period) {
        FinancialAnalyticsResponse source = financialAnalyticsService.getFinancialAnalytics(period);
        List<AnalyticsReportMetricResponse> statusMetrics = new ArrayList<>();
        source.invoiceStatus().forEach(status -> statusMetrics.add(
                countMetric("Invoice " + status.status(), status.count(), status.dataAvailability(), "Invoice-level status count.")));
        source.paymentStatus().forEach(status -> statusMetrics.add(
                countMetric("Payment Status " + status.status(), status.count(), status.dataAvailability(),
                        "Invoice-level payment status count; not a payment transaction count.")));
        List<AnalyticsReportSectionResponse> sections = List.of(
                section("Financial KPIs", source.dataAvailability(),
                        "Billed revenue is not collected cash; each metric retains its source definition.",
                        source.kpis().stream().map(this::financialMetric).toList()),
                section("Invoice and Payment Status", DataAvailability.LIVE,
                        "Real invoice-level status counts for the selected period.", statusMetrics),
                section("Revenue Source Coverage", source.revenueBySource().status(), source.revenueBySource().note(),
                        List.of(
                                countMetric("Categorized Billing Items", source.revenueBySource().categorizedBillingItems(),
                                        source.revenueBySource().status(), source.revenueBySource().note()),
                                countMetric("Uncategorized Billing Items", source.revenueBySource().uncategorizedBillingItems(),
                                        source.revenueBySource().status(), source.revenueBySource().note())
                        ))
        );
        return new ReportContent("Financial Analytics Report",
                "Snapshot of invoice and billing-item analytics. Payment transactions, refunds, and insurance revenue remain unavailable.",
                source.dataAvailability(), sections);
    }

    private ReportContent operationalReport(String period) {
        OperationalAnalyticsResponse source = operationalAnalyticsService.getOperationalAnalytics(period);
        List<AnalyticsReportSectionResponse> sections = List.of(
                section("Operational KPIs", source.dataAvailability(),
                        "Operational metrics retain source availability; unavailable capacity domains are not estimated.",
                        source.kpis().stream().map(this::operationalMetric).toList()),
                section("Inventory", source.inventorySummary().status(), source.inventorySummary().definition(),
                        List.of(
                                countMetric("Inventory Items", source.inventorySummary().totalItems(), DataAvailability.LIVE, "Real inventory document count."),
                                decimalMetric("Inventory Value", source.inventorySummary().inventoryValue(), "currency units",
                                        source.inventorySummary().status(), source.inventorySummary().definition(), null),
                                coverageMetric("Inventory Value Coverage", source.inventorySummary().validValueRecords(), source.inventorySummary().totalItems())
                        )),
                section("Laboratory Operations", source.laboratoryOperations().status(), source.laboratoryOperations().orderDefinition(),
                        List.of(
                                countMetric("Laboratory Orders", source.laboratoryOperations().totalOrders(), source.laboratoryOperations().status(), source.laboratoryOperations().orderDefinition()),
                                decimalMetric("Completion Rate", source.laboratoryOperations().completionRate(), "percent", DataAvailability.LIVE,
                                        "COMPLETED / non-cancelled LabTest orders × 100.", null),
                                decimalMetric("Average Published Turnaround", source.labTurnaround().averageHours(), "hours", source.labTurnaround().status(),
                                        source.labTurnaround().definition(), null),
                                coverageMetric("Turnaround Coverage", source.labTurnaround().validRecords(), source.labTurnaround().eligibleRecords())
                        ))
        );
        return new ReportContent("Operational Analytics Report",
                "Snapshot of inventory and laboratory operations. Bed, staff, equipment, appointment, and department operations remain unavailable.",
                source.dataAvailability(), sections);
    }

    private ReportContent populationHealthReport(String period) {
        PopulationHealthAnalyticsResponse source = populationHealthAnalyticsService.getPopulationHealthAnalytics(period);
        List<AnalyticsReportSectionResponse> sections = List.of(
                section("Population Health KPIs", source.dataAvailability(),
                        "Registered-account and laboratory indicators retain source limitations.",
                        source.kpis().stream().map(this::populationMetric).toList()),
                section("Demographic Coverage", DataAvailability.PARTIAL,
                        "Coverage reflects usable values among registered patient accounts.",
                        List.of(
                                coverageMetric("Age Coverage", source.ageDistribution().validRecords(), source.ageDistribution().totalPatientAccounts()),
                                coverageMetric("Gender Coverage", source.genderDistribution().validRecords(), source.genderDistribution().totalPatientAccounts()),
                                coverageMetric("Blood Group Coverage", source.bloodGroupDistribution().validRecords(), source.bloodGroupDistribution().totalPatientAccounts())
                        )),
                section("Laboratory Health Indicators", source.labHealthIndicators().status(), source.labHealthIndicators().limitation(),
                        List.of(
                                countMetric("Published Results", source.labHealthIndicators().publishedResults(), source.labHealthIndicators().status(), source.labHealthIndicators().denominator()),
                                countMetric("Abnormal Results", source.labHealthIndicators().abnormalResults(), source.labHealthIndicators().status(), source.labHealthIndicators().denominator()),
                                countMetric("Critical Results", source.labHealthIndicators().criticalResults(), source.labHealthIndicators().status(), source.labHealthIndicators().denominator())
                        ))
        );
        return new ReportContent("Population Health Analytics Report",
                "Snapshot of registered population growth, demographic coverage, and lab indicators; it is not disease prevalence.",
                source.dataAvailability(), sections);
    }

    private ReportContent executiveSummary(String period) {
        HealthcareAnalyticsResponse healthcare = healthcareAnalyticsService.getHealthcareAnalytics(period);
        FinancialAnalyticsResponse financial = financialAnalyticsService.getFinancialAnalytics(period);
        OperationalAnalyticsResponse operational = operationalAnalyticsService.getOperationalAnalytics(period);
        PopulationHealthAnalyticsResponse population = populationHealthAnalyticsService.getPopulationHealthAnalytics(period);

        List<AnalyticsReportSectionResponse> sections = List.of(
                section("Healthcare", healthcare.dataAvailability(),
                        "Registered patient accounts and real laboratory activity only.",
                        selectHealthcareMetrics(healthcare.kpis(), Set.of("Total Patients", "New Patients", "Laboratory Tests"))),
                section("Financial", financial.dataAvailability(),
                        "Invoice and billing analytics; billed revenue is not collected cash.",
                        selectFinancialMetrics(financial.kpis(), Set.of("Billed Revenue", "Invoice Count", "Paid Invoices"))),
                section("Operational", operational.dataAvailability(),
                        "Real inventory and laboratory workload data only.",
                        selectOperationalMetrics(operational.kpis(), Set.of(
                                "Inventory Items", "Low Stock Items", "Out of Stock Items", "Lab Test Orders", "Lab Completion Rate"))),
                section("Population Health", population.dataAvailability(),
                        "Registered-account growth, demographic coverage, and tested-user lab indicators only.",
                        selectPopulationMetrics(population.kpis(), Set.of(
                                "Registered Patient Accounts", "New Patient Accounts", "Published Lab Results", "Abnormal Lab Results")))
        );
        DataAvailability availability = combinedAvailability(List.of(
                healthcare.dataAvailability(), financial.dataAvailability(),
                operational.dataAvailability(), population.dataAvailability()));
        return new ReportContent("Executive Analytics Summary",
                "Transient cross-domain snapshot composed from Healthcare, Financial, Operational, and Population Health analytics.",
                availability, sections);
    }

    private List<AnalyticsReportMetricResponse> selectHealthcareMetrics(
            List<HealthcareKpiResponse> metrics, Set<String> names) {
        return metrics.stream().filter(metric -> names.contains(metric.name())).map(this::healthcareMetric).toList();
    }

    private List<AnalyticsReportMetricResponse> selectFinancialMetrics(
            List<FinancialKpiResponse> metrics, Set<String> names) {
        return metrics.stream().filter(metric -> names.contains(metric.name())).map(this::financialMetric).toList();
    }

    private List<AnalyticsReportMetricResponse> selectOperationalMetrics(
            List<OperationalKpiResponse> metrics, Set<String> names) {
        return metrics.stream().filter(metric -> names.contains(metric.name())).map(this::operationalMetric).toList();
    }

    private List<AnalyticsReportMetricResponse> selectPopulationMetrics(
            List<PopulationHealthKpiResponse> metrics, Set<String> names) {
        return metrics.stream().filter(metric -> names.contains(metric.name())).map(this::populationMetric).toList();
    }

    private AnalyticsReportMetricResponse healthcareMetric(HealthcareKpiResponse metric) {
        return new AnalyticsReportMetricResponse(metric.name(), stringValue(metric.value()), null,
                metric.status(), metric.definition(), metric.reason());
    }

    private AnalyticsReportMetricResponse financialMetric(FinancialKpiResponse metric) {
        return new AnalyticsReportMetricResponse(metric.name(), stringValue(metric.value()), null,
                metric.status(), metric.definition(), metric.reason());
    }

    private AnalyticsReportMetricResponse operationalMetric(OperationalKpiResponse metric) {
        return new AnalyticsReportMetricResponse(metric.name(), stringValue(metric.value()), metric.unit(),
                metric.status(), metric.definition(), metric.reason());
    }

    private AnalyticsReportMetricResponse populationMetric(PopulationHealthKpiResponse metric) {
        return new AnalyticsReportMetricResponse(metric.name(), stringValue(metric.value()), null,
                metric.status(), metric.definition(), metric.reason());
    }

    private AnalyticsReportSectionResponse section(
            String title,
            DataAvailability availability,
            String description,
            List<AnalyticsReportMetricResponse> metrics
    ) {
        return new AnalyticsReportSectionResponse(title, availability, description, metrics);
    }

    private AnalyticsReportMetricResponse countMetric(
            String name, long value, DataAvailability status, String definition) {
        return new AnalyticsReportMetricResponse(name, Long.toString(value), "count", status, definition, null);
    }

    private AnalyticsReportMetricResponse coverageMetric(String name, long valid, long total) {
        return new AnalyticsReportMetricResponse(name, valid + " / " + total, "records", DataAvailability.PARTIAL,
                "Valid records / total source records.", null);
    }

    private AnalyticsReportMetricResponse decimalMetric(
            String name,
            BigDecimal value,
            String unit,
            DataAvailability status,
            String definition,
            String reason
    ) {
        return new AnalyticsReportMetricResponse(name, stringValue(value), unit, status, definition, reason);
    }

    private DataAvailability combinedAvailability(List<DataAvailability> values) {
        if (values.stream().allMatch(value -> value == DataAvailability.LIVE)) return DataAvailability.LIVE;
        if (values.stream().allMatch(value -> value == DataAvailability.UNAVAILABLE)) return DataAvailability.UNAVAILABLE;
        if (values.stream().anyMatch(value -> value == DataAvailability.MOCK)) return DataAvailability.MOCK;
        return DataAvailability.PARTIAL;
    }

    private String normalizePeriod(String requestedPeriod) {
        String period = requestedPeriod == null || requestedPeriod.isBlank()
                ? "month"
                : requestedPeriod.trim().toLowerCase(Locale.ROOT);
        if (!SUPPORTED_PERIODS.contains(period)) {
            throw new IllegalArgumentException(
                    "Invalid period '" + requestedPeriod + "'. Supported values: today, week, month, year");
        }
        return period;
    }

    private List<ReportAvailabilityResponse> unavailableExports() {
        return List.of(
                unavailable("PDF", EXPORT_REASON),
                unavailable("EXCEL", EXPORT_REASON)
        );
    }

    private ReportAvailabilityResponse available(String feature) {
        return new ReportAvailabilityResponse(feature, DataAvailability.LIVE, null);
    }

    private ReportAvailabilityResponse unavailable(String feature, String reason) {
        return new ReportAvailabilityResponse(feature, DataAvailability.UNAVAILABLE, reason);
    }

    private String stringValue(Object value) {
        if (value == null) return null;
        if (value instanceof BigDecimal decimal) return decimal.toPlainString();
        return value.toString();
    }

    private record ReportContent(
            String title,
            String summary,
            DataAvailability availability,
            List<AnalyticsReportSectionResponse> sections
    ) {
    }
}
