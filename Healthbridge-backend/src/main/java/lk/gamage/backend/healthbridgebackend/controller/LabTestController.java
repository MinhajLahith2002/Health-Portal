package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.model.LabTest;
import lk.gamage.backend.healthbridgebackend.repository.LabTestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/lab/test-orders")
@RequiredArgsConstructor
public class LabTestController {


    private final LabTestRepository testRepository;

    @PostMapping
    public ResponseEntity<LabTest> createTestOrder(@RequestBody LabTest request) {
        request.setStatus(LabTest.TestStatus.REQUESTED);
        request.setRequestedAt(LocalDateTime.now());
        return ResponseEntity.ok(testRepository.save(request));
    }

    @GetMapping
    public ResponseEntity<List<LabTest>> getAll() {
        return ResponseEntity.ok(testRepository.findAll());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<LabTest>> getByPatient(@PathVariable String patientId) {
        return ResponseEntity.ok(testRepository.findByPatientId(patientId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<LabTest>> getByStatus(@PathVariable LabTest.TestStatus status) {
        return ResponseEntity.ok(testRepository.findByStatus(status));
    }
}
