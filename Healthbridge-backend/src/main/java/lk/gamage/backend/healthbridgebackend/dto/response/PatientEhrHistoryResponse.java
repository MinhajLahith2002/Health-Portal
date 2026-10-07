package lk.gamage.backend.healthbridgebackend.dto.response;

import java.time.LocalDateTime;
import java.util.List;


public class PatientEhrHistoryResponse {

    private String patientId;

    private LocalDateTime generatedAt;

    private List<MedicalRecordResponse> medicalRecords;

    private List<DiagnosisResponse> diagnoses;

    private List<TreatmentRecordResponse> treatments;

    private List<MedicalDocumentResponse> documents;


    public PatientEhrHistoryResponse() {
    }


    public String getPatientId() {
        return patientId;
    }


    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }


    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }


    public void setGeneratedAt(
            LocalDateTime generatedAt
    ) {
        this.generatedAt = generatedAt;
    }


    public List<MedicalRecordResponse>
    getMedicalRecords() {
        return medicalRecords;
    }


    public void setMedicalRecords(
            List<MedicalRecordResponse> medicalRecords
    ) {
        this.medicalRecords = medicalRecords;
    }


    public List<DiagnosisResponse>
    getDiagnoses() {
        return diagnoses;
    }


    public void setDiagnoses(
            List<DiagnosisResponse> diagnoses
    ) {
        this.diagnoses = diagnoses;
    }


    public List<TreatmentRecordResponse>
    getTreatments() {
        return treatments;
    }


    public void setTreatments(
            List<TreatmentRecordResponse> treatments
    ) {
        this.treatments = treatments;
    }


    public List<MedicalDocumentResponse>
    getDocuments() {
        return documents;
    }


    public void setDocuments(
            List<MedicalDocumentResponse> documents
    ) {
        this.documents = documents;
    }
}