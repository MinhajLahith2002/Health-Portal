package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.model.LabResult;
import lk.gamage.backend.healthbridgebackend.repository.LabResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LabResultService {

    private final LabResultRepository resultRepository;
    private final NotificationService notificationService; // handles FR-LAB-005

    public LabResult saveResult(LabResult result) {
        boolean anyOutOfRange = result.getParameters().stream()
                .anyMatch(LabResult.ResultParameter::isOutOfRange);
        result.setAbnormal(anyOutOfRange);

        // Simple critical rule: mark critical if flagged explicitly by lab tech
        // In real systems this checks against critical-value thresholds per parameter
        if (result.isCritical()) {
            result.setStatus(LabResult.ResultStatus.VERIFIED);
        }

        result.setResultedAt(LocalDateTime.now());
        LabResult saved = resultRepository.save(result);

        if (saved.isCritical()) {
            notificationService.sendCriticalResultAlert(saved);
        }
        return saved;
    }

    public LabResult publishResult(String resultId) {
        LabResult result = resultRepository.findById(resultId)
                .orElseThrow(() -> new RuntimeException("Result not found: " + resultId));
        result.setStatus(LabResult.ResultStatus.PUBLISHED);
        result.setPublishedAt(LocalDateTime.now());
        LabResult saved = resultRepository.save(result);

        notificationService.notifyResultAvailable(saved); // FR-LAB-005
        return saved;
    }

    public List<LabResult> getPatientHistory(String patientId) {
        return resultRepository.findByPatientIdOrderByResultedAtDesc(patientId); // FR-LAB-006
    }
}
