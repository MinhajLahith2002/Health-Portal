package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.request.HealthMetricRequest;
import lk.gamage.backend.healthbridgebackend.model.HealthMetric;
import java.util.List;

public interface HealthMetricService {
    HealthMetric logMetric(HealthMetricRequest request);
    List<HealthMetric> getMetricsByPatient(String patientId);
}
