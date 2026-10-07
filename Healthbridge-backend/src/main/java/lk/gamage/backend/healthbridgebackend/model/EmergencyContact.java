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
@Document(collection = "emergency_contacts")
public class EmergencyContact {
    @Id
    private String id;
    private String userId;
    private String name;
    private String relationship;
    private String phone;
    private String email;
    private boolean isPrimary;
    private Instant createdAt;
}
