package lk.gamage.backend.healthbridgebackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lk.gamage.backend.healthbridgebackend.model.TicketCategory;


public class CreateSupportTicketRequest {

    @NotBlank
    private String subject;

    @NotNull
    private TicketCategory category;

    @NotBlank
    private String description;

   
    @NotBlank
    private String contactNumber;

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public TicketCategory getCategory() {
        return category;
    }

    public void setCategory(TicketCategory category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

   

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }
}