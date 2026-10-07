package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.request.MedicalRecordRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.MedicalRecordResponse;

import java.util.List;

public interface MedicalRecordService {

    MedicalRecordResponse createMedicalRecord(
            MedicalRecordRequest request
    );

    List<MedicalRecordResponse> getAllMedicalRecords();

    MedicalRecordResponse getMedicalRecordById(
            String id
    );

    List<MedicalRecordResponse> getMedicalRecordsByPatientId(
            String patientId
    );

    List<MedicalRecordResponse> getMedicalRecordsByDoctorId(
            String doctorId
    );

    MedicalRecordResponse updateMedicalRecord(
            String id,
            MedicalRecordRequest request
    );

    MedicalRecordResponse archiveMedicalRecord(
            String id
    );

    MedicalRecordResponse restoreMedicalRecord(
            String id
    );

    List<MedicalRecordResponse> getArchivedMedicalRecords();

    void deleteMedicalRecordPermanently(
            String id
    );
}