package lk.gamage.backend.healthbridgebackend.analytics.financial.service.impl;

import lk.gamage.backend.healthbridgebackend.analytics.dto.response.DataAvailability;
import lk.gamage.backend.healthbridgebackend.analytics.financial.dto.response.*;
import lk.gamage.backend.healthbridgebackend.analytics.financial.repository.FinancialAnalyticsReadRepository;
import lk.gamage.backend.healthbridgebackend.analytics.financial.service.FinancialAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
@RequiredArgsConstructor
public class FinancialAnalyticsServiceImpl implements FinancialAnalyticsService {

    private static final Set<String> SUPPORTED_PERIODS = Set.of("today", "week", "month", "year");
    private static final String BILLED_REVENUE_DEFINITION =
            "Sum of totalAmount for non-cancelled invoices in the selected period; this is billed revenue, not collected cash.";
    private static final String DATE_DEFINITION =
            "Uses invoiceDate when present and createdAt as a fallback.";

    private final FinancialAnalyticsReadRepository repository;

    @Override
    public FinancialAnalyticsResponse getFinancialAnalytics(String requestedPeriod) {
        String period = normalizePeriod(requestedPeriod);
        ZoneId zone = ZoneId.systemDefault();
        ZonedDateTime now = ZonedDateTime.now(zone);
        PeriodWindow window = periodWindow(period, now);

        FinancialAnalyticsReadRepository.SummaryData summary =
                repository.summarizeValidInvoices(window.start(), window.end());
        Map<String, Long> invoiceStatuses = repository.countInvoiceStatuses(window.start(), window.end());
        Map<String, Long> paymentStatuses = repository.countPaymentStatuses(window.start(), window.end());
        FinancialAnalyticsReadRepository.RevenueSourceData sourceData =
                repository.aggregateRevenueBySource(window.start(), window.end());

        FinancialMetricAvailabilityResponse insurance = unavailable(
                "Insurance Revenue", "Insurance and claim persistence are not implemented.");
        FinancialMetricAvailabilityResponse refunds = unavailable(
                "Refunds", "Refund and payment transaction persistence are not implemented.");
        FinancialMetricAvailabilityResponse exactOutstanding = partial(
                "Outstanding Amount",
                "Only the full value of UNPAID invoices is known; remaining balances for PARTIALLY_PAID invoices are unavailable.");

        RevenueSourceResponse revenueBySource = revenueBySource(sourceData);

        return new FinancialAnalyticsResponse(
                Instant.now(),
                period,
                DataAvailability.PARTIAL,
                kpis(summary),
                revenueTrend(window),
                revenueBySource,
                statusResponses(invoiceStatuses, List.of("DRAFT", "ISSUED", "CANCELLED")),
                statusResponses(paymentStatuses, List.of("UNPAID", "PARTIALLY_PAID", "PAID")),
                new FinancialSummaryResponse(
                        DataAvailability.PARTIAL,
                        summary.invoiceCount(),
                        summary.billedRevenue(),
                        summary.paidInvoiceCount(),
                        summary.unpaidInvoiceCount(),
                        summary.partiallyPaidInvoiceCount(),
                        summary.knownUnpaidInvoiceAmount(),
                        "Known unpaid amount excludes unknown remaining balances on partially-paid invoices."
                ),
                List.of(
                        live("Billed Revenue", BILLED_REVENUE_DEFINITION + " " + DATE_DEFINITION),
                        live("Invoice Count", "Count of non-cancelled invoice records in the selected period. " + DATE_DEFINITION),
                        partial("Paid Invoices", "Counts invoice records whose paymentStatus is PAID; no payment transactions are available."),
                        exactOutstanding,
                        live("Revenue Trend", BILLED_REVENUE_DEFINITION + " Grouped by effective invoice date."),
                        partial("Revenue By Source", revenueBySource.note()),
                        live("Invoice Status", "Counts real invoice status values for all invoices in the selected period."),
                        live("Payment Status", "Counts real invoice-level paymentStatus values; these are not payment transactions."),
                        insurance,
                        refunds
                )
        );
    }

    private List<FinancialKpiResponse> kpis(FinancialAnalyticsReadRepository.SummaryData summary) {
        return List.of(
                new FinancialKpiResponse("Billed Revenue", summary.billedRevenue(), DataAvailability.LIVE,
                        BILLED_REVENUE_DEFINITION + " " + DATE_DEFINITION, null),
                new FinancialKpiResponse("Invoice Count", BigDecimal.valueOf(summary.invoiceCount()), DataAvailability.LIVE,
                        "Count of non-cancelled invoice records in the selected period.", null),
                new FinancialKpiResponse("Paid Invoices", BigDecimal.valueOf(summary.paidInvoiceCount()), DataAvailability.PARTIAL,
                        "Count of invoices whose invoice-level paymentStatus is PAID.",
                        "Payment transaction persistence is not implemented."),
                new FinancialKpiResponse("Known Unpaid Invoice Amount", summary.knownUnpaidInvoiceAmount(), DataAvailability.PARTIAL,
                        "Sum of totalAmount for invoices whose paymentStatus is UNPAID.",
                        "Partially-paid remaining balances cannot be calculated."),
                new FinancialKpiResponse("Insurance Revenue", null, DataAvailability.UNAVAILABLE, null,
                        "Insurance and claim persistence are not implemented."),
                new FinancialKpiResponse("Refunds", null, DataAvailability.UNAVAILABLE, null,
                        "Refund and payment transaction persistence are not implemented.")
        );
    }

    private List<RevenueTrendResponse> revenueTrend(PeriodWindow window) {
        return repository.aggregateRevenueTrend(
                        window.start(), window.end(), window.mongoFormat(), window.zone().getId()).stream()
                .map(point -> new RevenueTrendResponse(
                        trendLabel(point.periodKey(), window.period()),
                        point.billedRevenue(),
                        point.invoiceCount()))
                .toList();
    }

    private RevenueSourceResponse revenueBySource(FinancialAnalyticsReadRepository.RevenueSourceData data) {
        long uncategorized = Math.max(0, data.totalBillingItems() - data.categorizedBillingItems());
        String note = "Groups actual stored billing_items.category values for items linked to non-cancelled, in-period invoices; "
                + "blank or missing categories are reported as coverage gaps and no categories are invented.";
        return new RevenueSourceResponse(
                DataAvailability.PARTIAL,
                data.sources().stream()
                        .map(source -> new RevenueSourceResponse.Source(
                                source.category(), source.billedAmount(), source.billingItemCount()))
                        .toList(),
                data.totalBillingItems(),
                data.categorizedBillingItems(),
                uncategorized,
                note
        );
    }

    private List<InvoiceStatusResponse> statusResponses(Map<String, Long> counts, List<String> statuses) {
        return statuses.stream()
                .map(status -> new InvoiceStatusResponse(
                        status,
                        counts.getOrDefault(status, 0L),
                        DataAvailability.LIVE))
                .toList();
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
        String format = switch (period) {
            case "today" -> "%Y-%m-%dT%H";
            case "year" -> "%Y-%m";
            default -> "%Y-%m-%d";
        };
        return new PeriodWindow(start.toInstant(), now.plusNanos(1).toInstant(), format, now.getZone(), period);
    }

    private String trendLabel(String key, String period) {
        try {
            return switch (period) {
                case "today" -> java.time.LocalDateTime.parse(key, DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH"))
                        .format(DateTimeFormatter.ofPattern("HH:00"));
                case "year" -> YearMonth.parse(key).format(DateTimeFormatter.ofPattern("MMM"));
                default -> LocalDate.parse(key).format(DateTimeFormatter.ofPattern("dd MMM"));
            };
        } catch (RuntimeException ignored) {
            return key;
        }
    }

    private FinancialMetricAvailabilityResponse live(String metric, String definition) {
        return new FinancialMetricAvailabilityResponse(metric, DataAvailability.LIVE, null, definition);
    }

    private FinancialMetricAvailabilityResponse partial(String metric, String reason) {
        return new FinancialMetricAvailabilityResponse(metric, DataAvailability.PARTIAL, reason, null);
    }

    private FinancialMetricAvailabilityResponse unavailable(String metric, String reason) {
        return new FinancialMetricAvailabilityResponse(metric, DataAvailability.UNAVAILABLE, reason, null);
    }

    private record PeriodWindow(
            Instant start,
            Instant end,
            String mongoFormat,
            ZoneId zone,
            String period
    ) {
    }
}
