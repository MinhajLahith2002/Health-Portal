package lk.gamage.backend.healthbridgebackend.analytics.populationhealth.repository.impl;

import lk.gamage.backend.healthbridgebackend.analytics.populationhealth.repository.PopulationHealthAnalyticsReadRepository;
import lk.gamage.backend.healthbridgebackend.model.LabResult;
import lk.gamage.backend.healthbridgebackend.model.Role;
import lk.gamage.backend.healthbridgebackend.model.User;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.*;

@Repository
@RequiredArgsConstructor
public class PopulationHealthAnalyticsReadRepositoryImpl implements PopulationHealthAnalyticsReadRepository {

    private final MongoTemplate mongoTemplate;

    @Override
    public long countPatientAccounts() {
        return mongoTemplate.count(patientQuery(), User.class);
    }

    @Override
    public long countNewPatientAccounts(LocalDateTime start, LocalDateTime end) {
        Query query = patientQuery();
        query.addCriteria(Criteria.where("createdAt").gte(start).lt(end));
        return mongoTemplate.count(query, User.class);
    }

    @Override
    public long countPatientAccountsBefore(LocalDateTime end) {
        Query query = patientQuery();
        query.addCriteria(Criteria.where("createdAt").lt(end));
        return mongoTemplate.count(query, User.class);
    }

    @Override
    public Map<String, Long> countPopulationGrowth(
            LocalDateTime start,
            LocalDateTime end,
            String mongoDateFormat,
            String timezone
    ) {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("role").is(Role.PATIENT)
                        .and("createdAt").gte(start).lt(end)),
                context -> new Document("$group", new Document("_id",
                        new Document("$dateToString", new Document("format", mongoDateFormat)
                                .append("date", "$createdAt")
                                .append("timezone", timezone)))
                        .append("count", new Document("$sum", 1))),
                Aggregation.sort(org.springframework.data.domain.Sort.Direction.ASC, "_id")
        );
        return countsById(mongoTemplate.aggregate(aggregation, User.class, Document.class));
    }

    @Override
    public List<String> findPatientDateOfBirthValues() {
        Query query = patientQuery();
        query.fields().include("dateOfBirth").exclude("_id");
        return mongoTemplate.find(query, User.class).stream()
                .map(User::getDateOfBirth)
                .toList();
    }

    @Override
    public Map<String, Long> countGenderValues() {
        return countPatientField("gender");
    }

    @Override
    public Map<String, Long> countBloodGroupValues() {
        return countPatientField("bloodGroup");
    }

    @Override
    public LabIndicatorData summarizePublishedLabResults(LocalDateTime start, LocalDateTime end) {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("status").is(LabResult.ResultStatus.PUBLISHED)
                        .and("publishedAt").gte(start).lt(end)),
                context -> new Document("$group", new Document("_id", null)
                        .append("publishedResults", new Document("$sum", 1))
                        .append("abnormalResults", conditionalBooleanCount("$isAbnormal"))
                        .append("criticalResults", conditionalBooleanCount("$isCritical")))
        );
        Document result = first(mongoTemplate.aggregate(aggregation, LabResult.class, Document.class));
        if (result == null) return new LabIndicatorData(0, 0, 0);
        return new LabIndicatorData(
                longValue(result.get("publishedResults")),
                longValue(result.get("abnormalResults")),
                longValue(result.get("criticalResults")));
    }

    private Map<String, Long> countPatientField(String field) {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("role").is(Role.PATIENT)),
                Aggregation.group(field).count().as("count")
        );
        return countsById(mongoTemplate.aggregate(aggregation, User.class, Document.class));
    }

    private Document conditionalBooleanCount(String field) {
        return new Document("$sum", new Document("$cond", List.of(
                new Document("$eq", List.of(field, true)), 1, 0)));
    }

    private Query patientQuery() {
        return Query.query(Criteria.where("role").is(Role.PATIENT));
    }

    private Map<String, Long> countsById(AggregationResults<Document> results) {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (Document result : results.getMappedResults()) {
            Object id = result.get("_id");
            String key = id == null ? "" : id.toString();
            counts.put(key, longValue(result.get("count")));
        }
        return counts;
    }

    private Document first(AggregationResults<Document> results) {
        return results.getMappedResults().isEmpty() ? null : results.getMappedResults().get(0);
    }

    private long longValue(Object value) {
        return value instanceof Number number ? number.longValue() : 0L;
    }
}
