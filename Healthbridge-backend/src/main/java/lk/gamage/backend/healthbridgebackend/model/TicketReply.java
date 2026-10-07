package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketReply {

    private String id;
    private String senderId;
    private String senderName;
    private String senderRole; // "USER" or "ADMIN"
    private String message;
    private String imageUrl;
    private LocalDateTime createdAt;
}