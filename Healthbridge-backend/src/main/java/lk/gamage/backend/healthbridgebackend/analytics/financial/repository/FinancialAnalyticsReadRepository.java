package lk.gamage.backend.healthbridgebackend.analytics.financial.repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public interface FinancialAnalyticsReadRepository {

    SummaryData summarizeValidInvoices(Instant start, Instant end);

    List<TrendData> aggregateRevenueTrend(
            Instant start,
            Instant end,
            String mongoDateFormat,
            String timezone
    );

    Map<String, Long> countInvoiceStatuses(Instant start, Instant end);

    Map<String, Long> countPaymentStatuses(Instant start, Instant end);

    RevenueSourceData aggregateRevenueBySource(Instant start, Instant end);

    record SummaryData(
            long invoiceCount,
            BigDecimal billedRevenue,
            long paidInvoiceCount,
            long unpaidInvoiceCount,
            long partiallyPaidInvoiceCount,
            BigDecimal knownUnpaidInvoiceAmount
    ) {
    }

    record TrendData(String periodKey, BigDecimal billedRevenue, long invoiceCount) {
    }

    record RevenueSourceData(
            List<SourceData> sources,
            long totalBillingItems,
            long categorizedBillingItems
    ) {
    }

    record SourceData(String category, BigDecimal billedAmount, long billingItemCount) {
    }
}
