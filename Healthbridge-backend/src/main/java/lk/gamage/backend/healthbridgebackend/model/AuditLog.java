package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "audit_logs")
public class AuditLog {
    @Id
    private String id;
    private LocalDateTime timestamp;
    private String user;
    private String role;
    private String event;
    private String module;
    private String actionDetails;
    private String refId;
    private String ipDevice;
    private String status;
    private String severity;
}
