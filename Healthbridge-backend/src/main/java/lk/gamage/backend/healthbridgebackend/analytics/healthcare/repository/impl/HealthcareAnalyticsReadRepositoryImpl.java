package lk.gamage.backend.healthbridgebackend.analytics.healthcare.repository.impl;

import lk.gamage.backend.healthbridgebackend.analytics.healthcare.repository.HealthcareAnalyticsReadRepository;
import lk.gamage.backend.healthbridgebackend.model.LabTest;
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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class HealthcareAnalyticsReadRepositoryImpl implements HealthcareAnalyticsReadRepository {

    private final MongoTemplate mongoTemplate;

    @Override
    public long countPatientAccounts() {
        return mongoTemplate.count(patientQuery(), User.class);
    }

    @Override
    public long countPatientAccountsCreatedBetween(LocalDateTime start, LocalDateTime end) {
        Query query = patientQuery();
        query.addCriteria(Criteria.where("createdAt").gte(start).lt(end));
        return mongoTemplate.count(query, User.class);
    }

    @Override
    public long countPatientAccountsCreatedBefore(LocalDateTime end) {
        Query query = patientQuery();
        query.addCriteria(Criteria.where("createdAt").lt(end));
        return mongoTemplate.count(query, User.class);
    }

    @Override
    public Map<String, Long> countPatientGrowth(
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
    public long countLabTestOrdersBetween(LocalDateTime start, LocalDateTime end) {
        Query query = Query.query(Criteria.where("requestedAt").gte(start).lt(end));
        return mongoTemplate.count(query, LabTest.class);
    }

    @Override
    public Map<String, Long> countLabTestOrdersByStatus(LocalDateTime start, LocalDateTime end) {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("requestedAt").gte(start).lt(end)),
                Aggregation.group("status").count().as("count")
        );
        return countsById(mongoTemplate.aggregate(aggregation, LabTest.class, Document.class));
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
    public Map<String, Long> countPatientGenderValues() {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("role").is(Role.PATIENT)),
                Aggregation.group("gender").count().as("count")
        );
        return countsById(mongoTemplate.aggregate(aggregation, User.class, Document.class));
    }

    private Query patientQuery() {
        return Query.query(Criteria.where("role").is(Role.PATIENT));
    }

    private Map<String, Long> countsById(AggregationResults<Document> results) {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (Document result : results.getMappedResults()) {
            Object id = result.get("_id");
            Number count = result.get("count", Number.class);
            String key = id == null ? "" : id.toString().toUpperCase(Locale.ROOT);
            counts.put(key, count == null ? 0L : count.longValue());
        }
        return counts;
    }
}
