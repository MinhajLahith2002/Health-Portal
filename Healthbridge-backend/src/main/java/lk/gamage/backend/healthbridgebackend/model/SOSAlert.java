package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "sos_alerts")
public class SOSAlert {
    @Id
    private String id;
    private String userId;
    private String emergencyType; // e.g., "Chest Pain"
    
    private Location location;
    private PatientInfo patientInfo;
    
    private String status; // ACTIVE, CANCELLED, RESOLVED
    private Instant triggeredAt;
    private Instant resolvedAt;
    private String eta;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Location {
        private Double latitude;
        private Double longitude;
        private String address;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientInfo {
        private String name;
        private String bloodType;
        private List<String> allergies;
        private List<String> conditions;
    }
}
