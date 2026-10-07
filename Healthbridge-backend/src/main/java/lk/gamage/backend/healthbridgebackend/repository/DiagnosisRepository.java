package lk.gamage.backend.healthbridgebackend.repository;


import lk.gamage.backend.healthbridgebackend.model.Diagnosis;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface DiagnosisRepository 
        extends MongoRepository<Diagnosis, String> {


    List<Diagnosis> findByMedicalRecordId(
            String medicalRecordId
    );


    List<Diagnosis> findByPatientId(
            String patientId
    );


    List<Diagnosis> findByDoctorId(
            String doctorId
    );

}