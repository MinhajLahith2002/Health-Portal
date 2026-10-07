package lk.gamage.backend.healthbridgebackend.websocket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Generic envelope for WebRTC signaling exchanged between the two
 * participants of a telemedicine call. type distinguishes the payload:
 * "join", "offer", "answer", "ice-candidate", "leave", "chat", "screen-share-toggle".
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignalingMessage {
    private String type;
    private String senderId;
    private String roomCode;
    /** Raw JSON payload (SDP, ICE candidate, chat text, etc) as a string */
    private String payload;
}
