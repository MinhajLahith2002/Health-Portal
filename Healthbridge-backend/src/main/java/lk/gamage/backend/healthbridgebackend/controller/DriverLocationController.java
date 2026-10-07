package lk.gamage.backend.healthbridgebackend.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class DriverLocationController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/driver/location")
    public void receiveDriverLocation(@Payload DriverLocation location) {
        // Broadcast the driver's live location to the patient's map
        messagingTemplate.convertAndSend("/topic/driver/location", location);
    }

    @Data
    public static class DriverLocation {
        private double lat;
        private double lng;
        private double accuracy;
        private Double speed;
        private String driverId;
        private String alertId;
    }
}
