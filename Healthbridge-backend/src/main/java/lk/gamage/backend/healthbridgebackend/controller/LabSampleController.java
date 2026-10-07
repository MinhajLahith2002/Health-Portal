package lk.gamage.backend.healthbridgebackend.controller;

import lk.gamage.backend.healthbridgebackend.model.LabSample;
import lk.gamage.backend.healthbridgebackend.repository.LabSampleRepository;
import lk.gamage.backend.healthbridgebackend.service.LabSampleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lab/samples")
@RequiredArgsConstructor
public class LabSampleController {

    private final LabSampleService sampleService;
    private final LabSampleRepository sampleRepository;

    @PostMapping("/collect")
    public ResponseEntity<LabSample> collectSample(@RequestBody LabSample sample) {
        return ResponseEntity.ok(sampleService.collectSample(sample));
    }

    @PutMapping("/receive/{barcodeId}")
    public ResponseEntity<LabSample> receiveSample(@PathVariable String barcodeId) {
        return ResponseEntity.ok(sampleService.receiveByBarcode(barcodeId));
    }

    @GetMapping
    public ResponseEntity<List<LabSample>> getAllSamples() {
        return ResponseEntity.ok(sampleRepository.findAll());
    }

    @GetMapping("/test-order/{testOrderId}")
    public ResponseEntity<List<LabSample>> getByTestOrder(@PathVariable String testOrderId) {
        return ResponseEntity.ok(sampleRepository.findByTestOrderId(testOrderId));
    }
}