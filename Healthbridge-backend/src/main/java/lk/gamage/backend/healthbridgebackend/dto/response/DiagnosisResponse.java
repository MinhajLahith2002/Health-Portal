package lk.gamage.backend.healthbridgebackend.dto.response;

import java.time.LocalDate;


public class DiagnosisResponse {


    private String id;

    private String medicalRecordId;

    private String patientId;

    private String doctorId;

    private String diagnosisName;

    private String description;

    private String severity;

    private LocalDate diagnosedDate;



    public DiagnosisResponse() {
    }



    public String getId() {
        return id;
    }


    public void setId(String id) {
        this.id = id;
    }


    public String getMedicalRecordId() {
        return medicalRecordId;
    }


    public void setMedicalRecordId(String medicalRecordId) {
        this.medicalRecordId = medicalRecordId;
    }


    public String getPatientId() {
        return patientId;
    }


    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }


    public String getDoctorId() {
        return doctorId;
    }


    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }


    public String getDiagnosisName() {
        return diagnosisName;
    }


    public void setDiagnosisName(String diagnosisName) {
        this.diagnosisName = diagnosisName;
    }


    public String getDescription() {
        return description;
    }


    public void setDescription(String description) {
        this.description = description;
    }


    public String getSeverity() {
        return severity;
    }


    public void setSeverity(String severity) {
        this.severity = severity;
    }


    public LocalDate getDiagnosedDate() {
        return diagnosedDate;
    }


    public void setDiagnosedDate(LocalDate diagnosedDate) {
        this.diagnosedDate = diagnosedDate;
    }
}