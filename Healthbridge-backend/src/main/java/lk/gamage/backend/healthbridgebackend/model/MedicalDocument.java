package lk.gamage.backend.healthbridgebackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;


@Document(collection = "medical_documents")
public class MedicalDocument {

    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_SUPERSEDED = "SUPERSEDED";
    public static final String STATUS_ARCHIVED = "ARCHIVED";


    @Id
    private String id;

    private String medicalRecordId;

    private String patientId;

    private String doctorId;

    /*
     * All versions of the same logical document
     * share the same documentGroupId.
     */
    private String documentGroupId;

    /*
     * File version:
     * 1, 2, 3...
     */
    private Integer version = 1;

    /*
     * ACTIVE
     * SUPERSEDED
     * ARCHIVED
     */
    private String status = STATUS_ACTIVE;

    private String documentType;

    private String fileName;

    private String contentType;

    private long fileSize;

    private String fileUrl;

    /*
     * Internal Cloudinary fields.
     * These are stored in MongoDB but are not exposed
     * to the frontend response.
     */
    private String cloudinaryPublicId;

    private String cloudinaryResourceType;

    private String description;

    private LocalDateTime uploadedAt;

    private LocalDateTime updatedAt;

    private LocalDateTime archivedAt;


    public MedicalDocument() {
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


    public String getCloudinaryPublicId() {
        return cloudinaryPublicId;
    }


    public void setCloudinaryPublicId(String cloudinaryPublicId) {
        this.cloudinaryPublicId = cloudinaryPublicId;
    }


    public String getCloudinaryResourceType() {
        return cloudinaryResourceType;
    }


    public void setCloudinaryResourceType(
            String cloudinaryResourceType
    ) {
        this.cloudinaryResourceType =
                cloudinaryResourceType;
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