package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.MedicalRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository
        extends MongoRepository<MedicalRecord, String> {

    List<MedicalRecord> findByPatientIdOrderByVisitDateDesc(
            String patientId
    );

    List<MedicalRecord> findByDoctorIdOrderByVisitDateDesc(
            String doctorId
    );

    List<MedicalRecord> findAllByOrderByVisitDateDesc();
}