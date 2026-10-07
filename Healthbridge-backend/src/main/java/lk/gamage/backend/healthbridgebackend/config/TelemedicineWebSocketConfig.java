package lk.gamage.backend.healthbridgebackend.config;

import lk.gamage.backend.healthbridgebackend.websocket.TelemedicineSignalingHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class TelemedicineWebSocketConfig implements WebSocketConfigurer {

    private final TelemedicineSignalingHandler signalingHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(signalingHandler, "/ws/telemedicine/{roomCode}")
                .setAllowedOriginPatterns("*"); // tighten to your actual frontend origin(s) in production
    }
}
