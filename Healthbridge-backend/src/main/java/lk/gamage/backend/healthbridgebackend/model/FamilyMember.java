package lk.gamage.backend.healthbridgebackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "family_members")
public class FamilyMember {
    @Id
    private String id;
    private String primaryPatientId;
    private String name;
    private String relationship;
    private String dateOfBirth;
    private String linkedEmail;
    private LocalDateTime addedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
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
    public LocalDateTime getAddedAt() { return addedAt; }
    public void setAddedAt(LocalDateTime addedAt) { this.addedAt = addedAt; }
}
