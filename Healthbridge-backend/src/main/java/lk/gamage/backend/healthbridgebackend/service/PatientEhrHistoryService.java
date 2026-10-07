package lk.gamage.backend.healthbridgebackend.service;

import lk.gamage.backend.healthbridgebackend.dto.response.PatientEhrHistoryResponse;


public interface PatientEhrHistoryService {

    PatientEhrHistoryResponse getPatientEhrHistory(
            String patientId
    );
}