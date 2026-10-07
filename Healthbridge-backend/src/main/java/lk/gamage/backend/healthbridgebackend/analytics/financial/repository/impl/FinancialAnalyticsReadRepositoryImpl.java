package lk.gamage.backend.healthbridgebackend.analytics.financial.repository.impl;

import lk.gamage.backend.healthbridgebackend.analytics.financial.repository.FinancialAnalyticsReadRepository;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.bson.types.Decimal128;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Repository
@RequiredArgsConstructor
public class FinancialAnalyticsReadRepositoryImpl implements FinancialAnalyticsReadRepository {

    private static final String INVOICES = "invoices";
    private static final String BILLING_ITEMS = "billing_items";

    private final MongoTemplate mongoTemplate;

    @Override
    public SummaryData summarizeValidInvoices(Instant start, Instant end) {
        Aggregation aggregation = Aggregation.newAggregation(
                raw(validInvoiceMatch(start, end, null)),
                raw(new Document("$group", new Document("_id", null)
                        .append("invoiceCount", new Document("$sum", 1))
                        .append("billedRevenue", new Document("$sum", amountOrZero("$totalAmount")))
                        .append("paidInvoiceCount", conditionalCount("$paymentStatus", "PAID"))
                        .append("unpaidInvoiceCount", conditionalCount("$paymentStatus", "UNPAID"))
                        .append("partiallyPaidInvoiceCount", conditionalCount("$paymentStatus", "PARTIALLY_PAID"))
                        .append("knownUnpaidInvoiceAmount", new Document("$sum",
                                new Document("$cond", List.of(
                                        new Document("$eq", List.of("$paymentStatus", "UNPAID")),
                                        amountOrZero("$totalAmount"),
                                        0))))))
        );
        Document result = first(mongoTemplate.aggregate(aggregation, INVOICES, Document.class));
        if (result == null) {
            return new SummaryData(0, BigDecimal.ZERO, 0, 0, 0, BigDecimal.ZERO);
        }
        return new SummaryData(
                longValue(result.get("invoiceCount")),
                decimalValue(result.get("billedRevenue")),
                longValue(result.get("paidInvoiceCount")),
                longValue(result.get("unpaidInvoiceCount")),
                longValue(result.get("partiallyPaidInvoiceCount")),
                decimalValue(result.get("knownUnpaidInvoiceAmount"))
        );
    }

    @Override
    public List<TrendData> aggregateRevenueTrend(
            Instant start,
            Instant end,
            String mongoDateFormat,
            String timezone
    ) {
        Document effectiveDate = effectiveInvoiceDate("$");
        Aggregation aggregation = Aggregation.newAggregation(
                raw(validInvoiceMatch(start, end, null)),
                raw(new Document("$group", new Document("_id",
                        new Document("$dateToString", new Document("format", mongoDateFormat)
                                .append("date", effectiveDate)
                                .append("timezone", timezone)))
                        .append("billedRevenue", new Document("$sum", amountOrZero("$totalAmount")))
                        .append("invoiceCount", new Document("$sum", 1)))),
                raw(new Document("$sort", new Document("_id", 1)))
        );
        return mongoTemplate.aggregate(aggregation, INVOICES, Document.class).getMappedResults().stream()
                .map(document -> new TrendData(
                        Objects.toString(document.get("_id"), ""),
                        decimalValue(document.get("billedRevenue")),
                        longValue(document.get("invoiceCount"))))
                .toList();
    }

    @Override
    public Map<String, Long> countInvoiceStatuses(Instant start, Instant end) {
        return countStatuses(start, end, "status");
    }

    @Override
    public Map<String, Long> countPaymentStatuses(Instant start, Instant end) {
        return countStatuses(start, end, "paymentStatus");
    }

    @Override
    public RevenueSourceData aggregateRevenueBySource(Instant start, Instant end) {
        Document joinedDate = effectiveInvoiceDate("$invoice.");
        Document validJoinedInvoice = new Document("invoice.status", new Document("$ne", "CANCELLED"))
                .append("$expr", dateRangeExpression(joinedDate, start, end));

        Aggregation aggregation = Aggregation.newAggregation(
                raw(new Document("$lookup", new Document("from", INVOICES)
                        .append("localField", "invoiceId")
                        .append("foreignField", "_id")
                        .append("as", "invoice"))),
                raw(new Document("$unwind", "$invoice")),
                raw(new Document("$match", validJoinedInvoice)),
                raw(new Document("$group", new Document("_id", new Document("$cond", Arrays.asList(
                        new Document("$and", List.of(
                                new Document("$ne", Arrays.asList("$category", null)),
                                new Document("$ne", List.of(new Document("$trim", new Document("input", "$category")), ""))
                        )),
                        "$category",
                        null
                )))
                        .append("billedAmount", new Document("$sum", amountOrZero("$totalPrice")))
                        .append("billingItemCount", new Document("$sum", 1)))),
                raw(new Document("$sort", new Document("billedAmount", -1)))
        );

        List<SourceData> sources = new ArrayList<>();
        long totalItems = 0;
        long categorizedItems = 0;
        for (Document result : mongoTemplate.aggregate(aggregation, BILLING_ITEMS, Document.class).getMappedResults()) {
            long count = longValue(result.get("billingItemCount"));
            totalItems += count;
            Object category = result.get("_id");
            if (category != null) {
                categorizedItems += count;
                sources.add(new SourceData(
                        category.toString(),
                        decimalValue(result.get("billedAmount")),
                        count));
            }
        }
        return new RevenueSourceData(List.copyOf(sources), totalItems, categorizedItems);
    }

    private Map<String, Long> countStatuses(Instant start, Instant end, String field) {
        Aggregation aggregation = Aggregation.newAggregation(
                raw(validInvoiceMatch(start, end, true)),
                raw(new Document("$group", new Document("_id", "$" + field)
                        .append("count", new Document("$sum", 1))))
        );
        Map<String, Long> result = new HashMap<>();
        for (Document row : mongoTemplate.aggregate(aggregation, INVOICES, Document.class).getMappedResults()) {
            if (row.get("_id") != null) {
                result.put(row.get("_id").toString().toUpperCase(Locale.ROOT), longValue(row.get("count")));
            }
        }
        return result;
    }

    private Document validInvoiceMatch(Instant start, Instant end, Boolean includeCancelled) {
        Document match = new Document("$expr", dateRangeExpression(effectiveInvoiceDate("$"), start, end));
        if (!Boolean.TRUE.equals(includeCancelled)) {
            match.append("status", new Document("$ne", "CANCELLED"));
        }
        return new Document("$match", match);
    }

    private Document dateRangeExpression(Document date, Instant start, Instant end) {
        return new Document("$and", List.of(
                new Document("$gte", List.of(date, Date.from(start))),
                new Document("$lt", List.of(date, Date.from(end)))
        ));
    }

    private Document effectiveInvoiceDate(String prefix) {
        return new Document("$ifNull", List.of(prefix + "invoiceDate", prefix + "createdAt"));
    }

    private Document conditionalCount(String field, String expected) {
        return new Document("$sum", new Document("$cond", List.of(
                new Document("$eq", List.of(field, expected)), 1, 0)));
    }

    private Document amountOrZero(String field) {
        return new Document("$ifNull", List.of(field, 0));
    }

    private org.springframework.data.mongodb.core.aggregation.AggregationOperation raw(Document operation) {
        return context -> context.getMappedObject(operation);
    }

    private Document first(AggregationResults<Document> results) {
        return results.getMappedResults().isEmpty() ? null : results.getMappedResults().get(0);
    }

    private long longValue(Object value) {
        return value instanceof Number number ? number.longValue() : 0L;
    }

    private BigDecimal decimalValue(Object value) {
        if (value instanceof Decimal128 decimal128) return decimal128.bigDecimalValue();
        if (value instanceof BigDecimal decimal) return decimal;
        if (value instanceof Number number) return new BigDecimal(number.toString());
        return BigDecimal.ZERO;
    }
}
