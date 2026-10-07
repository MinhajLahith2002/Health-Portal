package lk.gamage.backend.healthbridgebackend.dto.response;

import java.time.LocalDateTime;


public class MedicalDocumentResponse {

    private String id;

    private String medicalRecordId;

    private String patientId;

    private String doctorId;

    private String documentGroupId;

    private Integer version;

    private String status;

    private String documentType;

    private String fileName;

    private String contentType;

    private long fileSize;

    private String fileUrl;

    private String description;

    private LocalDateTime uploadedAt;

    private LocalDateTime updatedAt;

    private LocalDateTime archivedAt;


    public MedicalDocumentResponse() {
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


    public String getDocumentGroupId() {
        return documentGroupId;
    }


    public void setDocumentGroupId(String documentGroupId) {
        this.documentGroupId = documentGroupId;
    }


    public Integer getVersion() {
        return version;
    }


    public void setVersion(Integer version) {
        this.version = version;
    }


    public String getStatus() {
        return status;
    }


    public void setStatus(String status) {
        this.status = status;
    }


    public String getDocumentType() {
        return documentType;
    }


    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }


    public String getFileName() {
        return fileName;
    }


    public void setFileName(String fileName) {
        this.fileName = fileName;
    }


    public String getContentType() {
        return contentType;
    }


    public void setContentType(String contentType) {
        this.contentType = contentType;
    }


    public long getFileSize() {
        return fileSize;
    }


    public void setFileSize(long fileSize) {
        this.fileSize = fileSize;
    }


    public String getFileUrl() {
        return fileUrl;
    }


    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }


    public String getDescription() {
        return description;
    }


    public void setDescription(String description) {
        this.description = description;
    }


    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }


    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }


    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }


    public LocalDateTime getArchivedAt() {
        return archivedAt;
    }


    public void setArchivedAt(LocalDateTime archivedAt) {
        this.archivedAt = archivedAt;
    }
}