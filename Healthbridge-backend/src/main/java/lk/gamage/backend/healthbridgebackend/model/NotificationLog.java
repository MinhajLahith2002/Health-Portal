package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notification_logs")
public class NotificationLog {
    @Id
    private String id;
    private String alertId;
    private String contactId;
    private String contactName;
    private String contactPhone;
    private String notificationType; // SMS, PUSH
    private String status; // SENT, FAILED
    private Instant sentAt;
    private String errorMessage;
}
