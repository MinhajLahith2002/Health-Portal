package lk.gamage.backend.healthbridgebackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public class MedicalRecordRequest {

    @NotBlank(message = "Patient ID is required")
    private String patientId;

    /*
     * Doctor ID is NOT required from frontend.
     * Logged-in doctor's JWT user ID will be used.
     */
    private String doctorId;

    /*
     * Doctor name is NOT required from frontend.
     * Logged-in doctor's JWT details will be used.
     */
    private String doctorName;

    @NotBlank(message = "Hospital name is required")
    private String hospitalName;

    @NotNull(message = "Visit date is required")
    private LocalDate visitDate;

    @NotBlank(message = "Record type is required")
    private String recordType;

    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;

    @NotBlank(message = "Clinical summary is required")
    private String clinicalSummary;

    private List<String> symptoms;

    private List<String> treatmentPlan;

    private String consultationNotes;

    private String status;


    public MedicalRecordRequest() {
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


    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }


    public String getHospitalName() {
        return hospitalName;
    }

    public void setHospitalName(String hospitalName) {
        this.hospitalName = hospitalName;
    }


    public LocalDate getVisitDate() {
        return visitDate;
    }

    public void setVisitDate(LocalDate visitDate) {
        this.visitDate = visitDate;
    }


    public String getRecordType() {
        return recordType;
    }

    public void setRecordType(String recordType) {
        this.recordType = recordType;
    }


    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }


    public String getClinicalSummary() {
        return clinicalSummary;
    }

    public void setClinicalSummary(String clinicalSummary) {
        this.clinicalSummary = clinicalSummary;
    }


    public List<String> getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(List<String> symptoms) {
        this.symptoms = symptoms;
    }


    public List<String> getTreatmentPlan() {
        return treatmentPlan;
    }

    public void setTreatmentPlan(List<String> treatmentPlan) {
        this.treatmentPlan = treatmentPlan;
    }


    public String getConsultationNotes() {
        return consultationNotes;
    }

    public void setConsultationNotes(String consultationNotes) {
        this.consultationNotes = consultationNotes;
    }


    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}