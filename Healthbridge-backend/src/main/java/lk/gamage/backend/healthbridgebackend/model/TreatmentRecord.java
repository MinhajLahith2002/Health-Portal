package lk.gamage.backend.healthbridgebackend.model;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;


@Document(collection = "treatment_records")
public class TreatmentRecord {


    @Id
    private String id;


    private String medicalRecordId;


    private String patientId;


    private String doctorId;


    private String treatmentType;


    private String description;


    private LocalDate startDate;


    private LocalDate endDate;


    private String status;




    public TreatmentRecord() {
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



    public String getTreatmentType() {
        return treatmentType;
    }



    public void setTreatmentType(String treatmentType) {
        this.treatmentType = treatmentType;
    }



    public String getDescription() {
        return description;
    }



    public void setDescription(String description) {
        this.description = description;
    }



    public LocalDate getStartDate() {
        return startDate;
    }



    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }



    public LocalDate getEndDate() {
        return endDate;
    }



    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }



    public String getStatus() {
        return status;
    }



    public void setStatus(String status) {
        this.status = status;
    }

}