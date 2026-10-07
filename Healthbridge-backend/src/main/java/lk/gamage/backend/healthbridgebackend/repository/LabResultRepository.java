package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.LabResult;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface LabResultRepository extends MongoRepository<LabResult, String> {

    List<LabResult> findByPatientId(String patientId);          // FR-LAB-006 history
    List<LabResult> findByPatientIdOrderByResultedAtDesc(String patientId);
    List<LabResult> findByIsCriticalTrueAndStatus(LabResult.ResultStatus status);
}
