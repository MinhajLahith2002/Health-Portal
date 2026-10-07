package lk.gamage.backend.healthbridgebackend.repository;


import lk.gamage.backend.healthbridgebackend.model.TreatmentRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;



@Repository
public interface TreatmentRecordRepository
        extends MongoRepository<TreatmentRecord, String> {



    List<TreatmentRecord> findByMedicalRecordId(
            String medicalRecordId
    );



    List<TreatmentRecord> findByPatientId(
            String patientId
    );



    List<TreatmentRecord> findByDoctorId(
            String doctorId
    );

}