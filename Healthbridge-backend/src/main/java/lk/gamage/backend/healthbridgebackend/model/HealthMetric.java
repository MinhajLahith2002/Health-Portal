package lk.gamage.backend.healthbridgebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "health_metrics")
public class HealthMetric {
    @Id
    private String id;
    private String patientId;
    private String metricType;
    private String value;
    private String unit;
    private LocalDateTime recordedAt;
}
