package lk.gamage.backend.healthbridgebackend.dto.request;


public class MedicalDocumentUpdateRequest {

    private String documentType;

    private String description;


    public MedicalDocumentUpdateRequest() {
    }


    public String getDocumentType() {
        return documentType;
    }


    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }


    public String getDescription() {
        return description;
    }


    public void setDescription(String description) {
        this.description = description;
    }
}