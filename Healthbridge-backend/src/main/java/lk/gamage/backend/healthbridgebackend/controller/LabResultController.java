package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.model.LabResult;
import lk.gamage.backend.healthbridgebackend.repository.LabResultRepository;
import lk.gamage.backend.healthbridgebackend.service.LabResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lab/results")
@RequiredArgsConstructor
public class LabResultController {

    private final LabResultService resultService;
    private final LabResultRepository resultRepository;

    @PostMapping
    public ResponseEntity<LabResult> saveResult(@RequestBody LabResult result) {
        return ResponseEntity.ok(resultService.saveResult(result));
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<LabResult> publish(@PathVariable String id) {
        return ResponseEntity.ok(resultService.publishResult(id));
    }

    @GetMapping
    public ResponseEntity<List<LabResult>> getAllResults() {
        return ResponseEntity.ok(resultRepository.findAll());
    }

    @GetMapping("/patient/{patientId}/history")
    public ResponseEntity<List<LabResult>> history(@PathVariable String patientId) {
        return ResponseEntity.ok(resultService.getPatientHistory(patientId));
    }
}
