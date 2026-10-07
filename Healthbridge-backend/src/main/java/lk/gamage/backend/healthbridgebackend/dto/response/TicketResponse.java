package lk.gamage.backend.healthbridgebackend.dto.response;

import lk.gamage.backend.healthbridgebackend.model.SupportTicket;
import lk.gamage.backend.healthbridgebackend.model.TicketCategory;
import lk.gamage.backend.healthbridgebackend.model.TicketStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class TicketResponse {

    private String id;
    private String userId;
    private String userName;
    private String userEmail;
    private String subject;
    private String description;
    private TicketCategory category;
    private String contactNumber;
    private String attachmentUrl;
    private TicketStatus status;
    private List<TicketReplyResponse> replies;
    private Integer feedbackRating;
    private String feedbackComment;
    private LocalDateTime feedbackSubmittedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TicketResponse() {
    }

    public TicketResponse(SupportTicket ticket) {
        this.id = ticket.getId();
        this.userId = ticket.getUserId();
        this.userName = ticket.getUserName();
        this.userEmail = ticket.getUserEmail();
        this.subject = ticket.getSubject();
        this.description = ticket.getDescription();
        this.category = ticket.getCategory();
        this.contactNumber = ticket.getContactNumber();
        this.attachmentUrl = ticket.getAttachmentUrl();
        this.status = ticket.getStatus();
        this.replies = ticket.getReplies() == null ? List.of() :
                ticket.getReplies().stream().map(TicketReplyResponse::new).collect(Collectors.toList());
        this.feedbackRating = ticket.getFeedbackRating();
        this.feedbackComment = ticket.getFeedbackComment();
        this.feedbackSubmittedAt = ticket.getFeedbackSubmittedAt();
        this.createdAt = ticket.getCreatedAt();
        this.updatedAt = ticket.getUpdatedAt();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TicketCategory getCategory() { return category; }
    public void setCategory(TicketCategory category) { this.category = category; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getAttachmentUrl() { return attachmentUrl; }
    public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public List<TicketReplyResponse> getReplies() { return replies; }
    public void setReplies(List<TicketReplyResponse> replies) { this.replies = replies; }

    public Integer getFeedbackRating() { return feedbackRating; }
    public void setFeedbackRating(Integer feedbackRating) { this.feedbackRating = feedbackRating; }

    public String getFeedbackComment() { return feedbackComment; }
    public void setFeedbackComment(String feedbackComment) { this.feedbackComment = feedbackComment; }

    public LocalDateTime getFeedbackSubmittedAt() { return feedbackSubmittedAt; }
    public void setFeedbackSubmittedAt(LocalDateTime feedbackSubmittedAt) { this.feedbackSubmittedAt = feedbackSubmittedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}