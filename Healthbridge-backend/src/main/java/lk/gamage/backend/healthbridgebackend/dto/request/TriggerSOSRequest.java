package lk.gamage.backend.healthbridgebackend.dto.request;

import lombok.Data;

@Data
public class TriggerSOSRequest {
    private String emergencyType;
    private LocationDTO location;

    @Data
    public static class LocationDTO {
        private Double latitude;
        private Double longitude;
        private String address;
    }
}
