package lk.gamage.backend.healthbridgebackend.dto.response;

import lk.gamage.backend.healthbridgebackend.model.TicketReply;

import java.time.LocalDateTime;

public class TicketReplyResponse {

    private String id;
    private String senderId;
    private String senderName;
    private String senderRole;
    private String message;
    private String imageUrl;
    private LocalDateTime createdAt;

    public TicketReplyResponse() {
    }

    public TicketReplyResponse(TicketReply reply) {
        this.id = reply.getId();
        this.senderId = reply.getSenderId();
        this.senderName = reply.getSenderName();
        this.senderRole = reply.getSenderRole();
        this.message = reply.getMessage();
        this.imageUrl = reply.getImageUrl();
        this.createdAt = reply.getCreatedAt();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderRole() { return senderRole; }
    public void setSenderRole(String senderRole) { this.senderRole = senderRole; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}