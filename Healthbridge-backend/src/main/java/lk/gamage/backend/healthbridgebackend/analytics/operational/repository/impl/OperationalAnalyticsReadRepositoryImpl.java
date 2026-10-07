package lk.gamage.backend.healthbridgebackend.analytics.operational.repository.impl;

import lk.gamage.backend.healthbridgebackend.analytics.operational.repository.OperationalAnalyticsReadRepository;
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
public class OperationalAnalyticsReadRepositoryImpl implements OperationalAnalyticsReadRepository {

    private static final String INVENTORY = "hospital_inventory";
    private static final String LAB_TESTS = "lab_tests";
    private static final String LAB_SAMPLES = "lab_samples";
    private static final String LAB_RESULTS = "lab_results";

    private final MongoTemplate mongoTemplate;

    @Override
    public InventoryData summarizeInventory() {
        Document validValue = new Document("$and", List.of(
                new Document("$isNumber", "$quantity"),
                new Document("$isNumber", "$unitCost")
        ));
        Document group = new Document("_id", null)
                .append("totalItems", new Document("$sum", 1))
                .append("inStock", conditionalCount("$status", "IN_STOCK"))
                .append("lowStock", conditionalCount("$status", "LOW_STOCK"))
                .append("outOfStock", conditionalCount("$status", "OUT_OF_STOCK"))
                .append("expired", conditionalCount("$status", "EXPIRED"))
                .append("validValueRecords", new Document("$sum", new Document("$cond", List.of(validValue, 1, 0))))
                .append("inventoryValue", new Document("$sum", new Document("$cond", List.of(
                        validValue,
                        new Document("$multiply", List.of("$quantity", "$unitCost")),
                        0))));
        Aggregation aggregation = Aggregation.newAggregation(raw(new Document("$group", group)));
        Document result = first(mongoTemplate.aggregate(aggregation, INVENTORY, Document.class));
        if (result == null) {
            return new InventoryData(0, zeroInventoryStatuses(), BigDecimal.ZERO, 0);
        }
        Map<String, Long> statuses = new LinkedHashMap<>();
        statuses.put("IN_STOCK", longValue(result.get("inStock")));
        statuses.put("LOW_STOCK", longValue(result.get("lowStock")));
        statuses.put("OUT_OF_STOCK", longValue(result.get("outOfStock")));
        statuses.put("EXPIRED", longValue(result.get("expired")));
        return new InventoryData(
                longValue(result.get("totalItems")),
                statuses,
                decimalValue(result.get("inventoryValue")),
                longValue(result.get("validValueRecords")));
    }

    @Override
    public LabOrderData summarizeLabOrders(Instant start, Instant end) {
        Aggregation aggregation = Aggregation.newAggregation(
                raw(new Document("$match", dateRangeMatch("requestedAt", start, end))),
                raw(new Document("$group", new Document("_id", "$status")
                        .append("count", new Document("$sum", 1))))
        );
        Map<String, Long> statuses = zeroLabStatuses();
        long total = 0;
        for (Document row : mongoTemplate.aggregate(aggregation, LAB_TESTS, Document.class).getMappedResults()) {
            long count = longValue(row.get("count"));
            total += count;
            if (row.get("_id") != null) {
                statuses.put(row.get("_id").toString().toUpperCase(Locale.ROOT), count);
            }
        }
        return new LabOrderData(total, statuses);
    }

    @Override
    public Map<String, Long> countLinkedSampleStatuses(Instant start, Instant end) {
        Aggregation aggregation = Aggregation.newAggregation(
                raw(new Document("$lookup", new Document("from", LAB_TESTS)
                        .append("localField", "testOrderId")
                        .append("foreignField", "_id")
                        .append("as", "test"))),
                raw(new Document("$unwind", "$test")),
                raw(new Document("$match", dateRangeMatch("test.requestedAt", start, end))),
                raw(new Document("$group", new Document("_id", "$status")
                        .append("count", new Document("$sum", 1))))
        );
        Map<String, Long> statuses = zeroSampleStatuses();
        for (Document row : mongoTemplate.aggregate(aggregation, LAB_SAMPLES, Document.class).getMappedResults()) {
            if (row.get("_id") != null) {
                statuses.put(row.get("_id").toString().toUpperCase(Locale.ROOT), longValue(row.get("count")));
            }
        }
        return statuses;
    }

    @Override
    public TurnaroundData calculatePublishedResultTurnaround(Instant start, Instant end) {
        Aggregation aggregation = Aggregation.newAggregation(
                raw(new Document("$match", dateRangeMatch("requestedAt", start, end)
                        .append("status", new Document("$ne", "CANCELLED")))),
                raw(new Document("$lookup", new Document("from", LAB_RESULTS)
                        .append("localField", "_id")
                        .append("foreignField", "testOrderId")
                        .append("as", "result"))),
                raw(new Document("$unwind", "$result")),
                raw(new Document("$match", new Document("result.publishedAt", new Document("$ne", null)))),
                raw(new Document("$group", new Document("_id", "$_id")
                        .append("requestedAt", new Document("$first", "$requestedAt"))
                        .append("publishedAt", new Document("$min", "$result.publishedAt")))),
                raw(new Document("$match", new Document("$expr",
                        new Document("$gte", List.of("$publishedAt", "$requestedAt"))))),
                raw(new Document("$group", new Document("_id", null)
                        .append("validRecords", new Document("$sum", 1))
                        .append("averageHours", new Document("$avg",
                                new Document("$divide", List.of(
                                        new Document("$subtract", List.of("$publishedAt", "$requestedAt")),
                                        3_600_000))))))
        );
        Document result = first(mongoTemplate.aggregate(aggregation, LAB_TESTS, Document.class));
        if (result == null) {
            return new TurnaroundData(BigDecimal.ZERO, 0);
        }
        return new TurnaroundData(
                decimalValue(result.get("averageHours")),
                longValue(result.get("validRecords")));
    }

    private Document dateRangeMatch(String field, Instant start, Instant end) {
        return new Document(field, new Document("$gte", Date.from(start)).append("$lt", Date.from(end)));
    }

    private Document conditionalCount(String field, String expected) {
        return new Document("$sum", new Document("$cond", List.of(
                new Document("$eq", List.of(field, expected)), 1, 0)));
    }

    private Map<String, Long> zeroInventoryStatuses() {
        Map<String, Long> statuses = new LinkedHashMap<>();
        for (String status : List.of("IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "EXPIRED")) statuses.put(status, 0L);
        return statuses;
    }

    private Map<String, Long> zeroLabStatuses() {
        Map<String, Long> statuses = new LinkedHashMap<>();
        for (String status : List.of("REQUESTED", "SAMPLE_COLLECTED", "PROCESSING", "COMPLETED", "CANCELLED")) statuses.put(status, 0L);
        return statuses;
    }

    private Map<String, Long> zeroSampleStatuses() {
        Map<String, Long> statuses = new LinkedHashMap<>();
        for (String status : List.of("PENDING", "COLLECTED", "IN_TRANSIT", "RECEIVED", "REJECTED")) statuses.put(status, 0L);
        return statuses;
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
