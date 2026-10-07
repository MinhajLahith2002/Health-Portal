package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.HealthMetric;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface HealthMetricRepository extends MongoRepository<HealthMetric, String> {
    List<HealthMetric> findByPatientIdOrderByRecordedAtDesc(String patientId);
}
