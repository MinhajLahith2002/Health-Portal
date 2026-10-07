package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.dto.request.HealthMetricRequest;
import lk.gamage.backend.healthbridgebackend.model.HealthMetric;
import lk.gamage.backend.healthbridgebackend.service.HealthMetricService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/health-metrics")
public class HealthMetricController {

    @Autowired
    private HealthMetricService service;

    @PostMapping
    public ResponseEntity<HealthMetric> logMetric(@RequestBody HealthMetricRequest request) {
        return ResponseEntity.ok(service.logMetric(request));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<HealthMetric>> getPatientMetrics(@PathVariable String patientId) {
        return ResponseEntity.ok(service.getMetricsByPatient(patientId));
    }
}
