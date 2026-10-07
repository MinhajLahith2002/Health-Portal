package lk.gamage.backend.healthbridgebackend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "insurance_messages")
public class InsuranceMessage {
    @Id
    private String id;
    private String policyId;
    private String senderId; 
    private String receiverId; 
    private String messageContent;
    private boolean isRead = false; 
    private LocalDateTime sentAt = LocalDateTime.now();
}
