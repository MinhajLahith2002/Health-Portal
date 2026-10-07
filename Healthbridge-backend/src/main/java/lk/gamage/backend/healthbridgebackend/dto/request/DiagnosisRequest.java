package lk.gamage.backend.healthbridgebackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;


public class DiagnosisRequest {


    @NotBlank(message = "Medical record ID is required")
    private String medicalRecordId;


    @NotBlank(message = "Patient ID is required")
    private String patientId;


    /*
     * Not required from frontend.
     * Logged-in doctor's JWT user ID
     * will be used.
     */
    private String doctorId;


    @NotBlank(message = "Diagnosis name is required")
    private String diagnosisName;


    private String description;


    private String severity;


    @NotNull(message = "Diagnosed date is required")
    private LocalDate diagnosedDate;



    public DiagnosisRequest() {
    }


    public String getMedicalRecordId() {
        return medicalRecordId;
    }


    public void setMedicalRecordId(
            String medicalRecordId
    ) {
        this.medicalRecordId =
                medicalRecordId;
    }


    public String getPatientId() {
        return patientId;
    }


    public void setPatientId(
            String patientId
    ) {
        this.patientId =
                patientId;
    }


    public String getDoctorId() {
        return doctorId;
    }


    public void setDoctorId(
            String doctorId
    ) {
        this.doctorId =
                doctorId;
    }


    public String getDiagnosisName() {
        return diagnosisName;
    }


    public void setDiagnosisName(
            String diagnosisName
    ) {
        this.diagnosisName =
                diagnosisName;
    }


    public String getDescription() {
        return description;
    }


    public void setDescription(
            String description
    ) {
        this.description =
                description;
    }


    public String getSeverity() {
        return severity;
    }


    public void setSeverity(
            String severity
    ) {
        this.severity =
                severity;
    }


    public LocalDate getDiagnosedDate() {
        return diagnosedDate;
    }


    public void setDiagnosedDate(
            LocalDate diagnosedDate
    ) {
        this.diagnosedDate =
                diagnosedDate;
    }
}