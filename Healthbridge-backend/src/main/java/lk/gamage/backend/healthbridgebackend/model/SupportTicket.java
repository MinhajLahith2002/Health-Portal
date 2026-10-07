package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "support_tickets")
public class SupportTicket {

    @Id
    private String id;

    private String userId;
    private String userName;
    private String userEmail;

    private String subject;
    private String description;
    private TicketCategory category;
    private String contactNumber;

    private String attachmentUrl;
    private String attachmentPublicId;

    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;

    @Builder.Default
    private List<TicketReply> replies = new ArrayList<>();

    private Integer feedbackRating;
    private String feedbackComment;
    private LocalDateTime feedbackSubmittedAt;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}