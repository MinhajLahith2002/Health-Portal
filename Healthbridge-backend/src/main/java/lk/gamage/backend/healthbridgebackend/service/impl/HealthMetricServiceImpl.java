package lk.gamage.backend.healthbridgebackend.service.impl;

import lk.gamage.backend.healthbridgebackend.dto.request.HealthMetricRequest;
import lk.gamage.backend.healthbridgebackend.model.HealthMetric;
import lk.gamage.backend.healthbridgebackend.repository.HealthMetricRepository;
import lk.gamage.backend.healthbridgebackend.service.HealthMetricService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class HealthMetricServiceImpl implements HealthMetricService {

    @Autowired
    private HealthMetricRepository repository;

    @Override
    public HealthMetric logMetric(HealthMetricRequest request) {
        HealthMetric metric = HealthMetric.builder()
                .patientId(request.getPatientId())
                .metricType(request.getMetricType())
                .value(request.getValue())
                .unit(request.getUnit())
                .recordedAt(LocalDateTime.now())
                .build();
        return repository.save(metric);
    }

    @Override
    public List<HealthMetric> getMetricsByPatient(String patientId) {
        return repository.findByPatientIdOrderByRecordedAtDesc(patientId);
    }
}
