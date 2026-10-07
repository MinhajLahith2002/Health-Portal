package lk.gamage.backend.healthbridgebackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;


public class TreatmentRecordRequest {


    @NotBlank(message = "Medical record ID is required")
    private String medicalRecordId;


    @NotBlank(message = "Patient ID is required")
    private String patientId;


    /*
     * Doctor ID is not required from frontend.
     * Logged-in doctor's JWT user ID will be used.
     */
    private String doctorId;


    @NotBlank(message = "Treatment type is required")
    private String treatmentType;


    private String description;


    @NotNull(message = "Start date is required")
    private LocalDate startDate;


    private LocalDate endDate;


    private String status;



    public TreatmentRecordRequest() {
    }


    public String getMedicalRecordId() {
        return medicalRecordId;
    }


    public void setMedicalRecordId(
            String medicalRecordId
    ) {
        this.medicalRecordId = medicalRecordId;
    }


    public String getPatientId() {
        return patientId;
    }


    public void setPatientId(
            String patientId
    ) {
        this.patientId = patientId;
    }


    public String getDoctorId() {
        return doctorId;
    }


    public void setDoctorId(
            String doctorId
    ) {
        this.doctorId = doctorId;
    }


    public String getTreatmentType() {
        return treatmentType;
    }


    public void setTreatmentType(
            String treatmentType
    ) {
        this.treatmentType = treatmentType;
    }


    public String getDescription() {
        return description;
    }


    public void setDescription(
            String description
    ) {
        this.description = description;
    }


    public LocalDate getStartDate() {
        return startDate;
    }


    public void setStartDate(
            LocalDate startDate
    ) {
        this.startDate = startDate;
    }


    public LocalDate getEndDate() {
        return endDate;
    }


    public void setEndDate(
            LocalDate endDate
    ) {
        this.endDate = endDate;
    }


    public String getStatus() {
        return status;
    }


    public void setStatus(
            String status
    ) {
        this.status = status;
    }
}