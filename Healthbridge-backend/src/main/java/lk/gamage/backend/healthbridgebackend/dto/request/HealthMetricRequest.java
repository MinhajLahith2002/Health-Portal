package lk.gamage.backend.healthbridgebackend.dto.request;

import lombok.Data;

@Data
public class HealthMetricRequest {
    private String patientId;
    private String metricType;
    private String value;
    private String unit;
}
