package lk.gamage.backend.healthbridgebackend.service;


import lk.gamage.backend.healthbridgebackend.model.LabSample;
import lk.gamage.backend.healthbridgebackend.model.LabTest;
import lk.gamage.backend.healthbridgebackend.repository.LabSampleRepository;
import lk.gamage.backend.healthbridgebackend.repository.LabTestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class LabSampleService {

    private final LabSampleRepository sampleRepository;
    private final LabTestRepository testRepository;

    public LabSample collectSample(LabSample sample) {
        sample.setStatus(LabSample.SampleStatus.COLLECTED);
        sample.setCollectedAt(LocalDateTime.now());
        LabSample saved = sampleRepository.save(sample);

        // update the parent test order status
        testRepository.findById(sample.getTestOrderId()).ifPresent(test -> {
            test.setStatus(LabTest.TestStatus.SAMPLE_COLLECTED);
            test.setUpdatedAt(LocalDateTime.now());
            testRepository.save(test);
        });
        return saved;
    }

    public LabSample receiveByBarcode(String barcodeId) {
        LabSample sample = sampleRepository.findByBarcodeId(barcodeId)
                .orElseThrow(() -> new RuntimeException("No sample with barcode: " + barcodeId));
        sample.setStatus(LabSample.SampleStatus.RECEIVED);
        sample.setReceivedAt(LocalDateTime.now());
        return sampleRepository.save(sample);
    }

}
