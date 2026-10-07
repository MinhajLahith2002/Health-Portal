package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.LabTest;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface LabTestRepository extends MongoRepository<LabTest, String> {

    List<LabTest> findByPatientId(String patientId);
    List<LabTest> findByStatus(LabTest.TestStatus status);
    List<LabTest> findByDoctorId(String doctorId);
}
