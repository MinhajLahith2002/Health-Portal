package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.request.DiagnosisRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.DiagnosisResponse;

import java.util.List;


public interface DiagnosisService {


    DiagnosisResponse createDiagnosis(
            DiagnosisRequest request
    );


    List<DiagnosisResponse> getAllDiagnoses();


    DiagnosisResponse getDiagnosisById(
            String id
    );


    List<DiagnosisResponse> getDiagnosesByMedicalRecord(
            String medicalRecordId
    );


    List<DiagnosisResponse> getDiagnosesByPatient(
            String patientId
    );


    List<DiagnosisResponse> getDiagnosesByDoctor(
            String doctorId
    );


    DiagnosisResponse updateDiagnosis(
            String id,
            DiagnosisRequest request
    );


    void deleteDiagnosis(
            String id
    );
}