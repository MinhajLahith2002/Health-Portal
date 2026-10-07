package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.request.TreatmentRecordRequest;
import lk.gamage.backend.healthbridgebackend.dto.response.TreatmentRecordResponse;

import java.util.List;


public interface TreatmentRecordService {


    TreatmentRecordResponse createTreatment(
            TreatmentRecordRequest request
    );


    List<TreatmentRecordResponse>
    getAllTreatments();


    TreatmentRecordResponse getTreatmentById(
            String id
    );


    List<TreatmentRecordResponse>
    getTreatmentsByMedicalRecord(
            String medicalRecordId
    );


    List<TreatmentRecordResponse>
    getTreatmentsByPatient(
            String patientId
    );


    List<TreatmentRecordResponse>
    getTreatmentsByDoctor(
            String doctorId
    );


    TreatmentRecordResponse updateTreatment(
            String id,
            TreatmentRecordRequest request
    );


    void deleteTreatment(
            String id
    );
}