package lk.gamage.backend.healthbridgebackend.dto.request;

public class FamilyMemberRequest {
    private String primaryPatientId;
    private String name;
    private String relationship;
    private String dateOfBirth;
    private String linkedEmail;

    public String getPrimaryPatientId() { return primaryPatientId; }
    public void setPrimaryPatientId(String primaryPatientId) { this.primaryPatientId = primaryPatientId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }
    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getLinkedEmail() { return linkedEmail; }
    public void setLinkedEmail(String linkedEmail) { this.linkedEmail = linkedEmail; }
}
