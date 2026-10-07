package lk.gamage.backend.healthbridgebackend.repository;

import lk.gamage.backend.healthbridgebackend.model.MedicalDocument;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface MedicalDocumentRepository
        extends MongoRepository<MedicalDocument, String> {


    List<MedicalDocument>
    findAllByOrderByUploadedAtDesc();


    List<MedicalDocument>
    findByMedicalRecordIdOrderByUploadedAtDesc(
            String medicalRecordId
    );


    List<MedicalDocument>
    findByPatientIdOrderByUploadedAtDesc(
            String patientId
    );


    List<MedicalDocument>
    findByDoctorIdOrderByUploadedAtDesc(
            String doctorId
    );


    List<MedicalDocument>
    findByDocumentGroupIdOrderByVersionDesc(
            String documentGroupId
    );


    List<MedicalDocument>
    findByStatusOrderByUploadedAtDesc(
            String status
    );
}