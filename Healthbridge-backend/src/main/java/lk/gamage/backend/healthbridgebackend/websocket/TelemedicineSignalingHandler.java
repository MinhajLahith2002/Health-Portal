package lk.gamage.backend.healthbridgebackend.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * Relays WebRTC signaling (SDP offer/answer, ICE candidates) between the two
 * participants of a telemedicine session room. Each room holds at most two
 * active sessions (patient + doctor); messages from one are broadcast to the
 * other. No media flows through this server — only the handshake.
 *
 * Path: /ws/telemedicine/{roomCode}
 */
@Slf4j
@Component
public class TelemedicineSignalingHandler extends TextWebSocketHandler {

    private static final String ROOM_CODE_ATTR = "roomCode";

    /** roomCode -> set of open sessions in that room (max 2 expected) */
    private final Map<String, CopyOnWriteArraySet<WebSocketSession>> rooms = new ConcurrentHashMap<>();

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String roomCode = extractRoomCode(session);
        session.getAttributes().put(ROOM_CODE_ATTR, roomCode);

        rooms.computeIfAbsent(roomCode, k -> new CopyOnWriteArraySet<>()).add(session);
        log.info("Session {} joined telemedicine room {}", session.getId(), roomCode);

        SignalingMessage joined = new SignalingMessage("peer-joined", session.getId(), roomCode, null);
        broadcastToOthers(session, roomCode, joined);

        // If someone is already in the room, tell the newcomer too. Otherwise, when the
        // initiator (patient) arrives second, it never learns the doctor is waiting and no offer is sent.
        boolean othersPresent = rooms.get(roomCode).stream()
                .anyMatch(p -> !p.getId().equals(session.getId()) && p.isOpen());
        if (othersPresent) {
            try {
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(joined)));
            } catch (IOException e) {
                log.error("Failed to notify new peer in room {}", roomCode, e);
            }
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String roomCode = (String) session.getAttributes().get(ROOM_CODE_ATTR);
        if (roomCode == null) {
            return;
        }

        SignalingMessage incoming = objectMapper.readValue(message.getPayload(), SignalingMessage.class);
        incoming.setRoomCode(roomCode);
        incoming.setSenderId(session.getId());

        // Relay offer / answer / ice-candidate / chat / screen-share-toggle to the other peer in the room
        broadcastToOthers(session, roomCode, incoming);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String roomCode = (String) session.getAttributes().get(ROOM_CODE_ATTR);
        if (roomCode == null) {
            return;
        }

        CopyOnWriteArraySet<WebSocketSession> peers = rooms.get(roomCode);
        if (peers != null) {
            peers.remove(session);
            if (peers.isEmpty()) {
                rooms.remove(roomCode);
            }
        }

        broadcastToOthers(session, roomCode, new SignalingMessage(
                "peer-left", session.getId(), roomCode, null));
        log.info("Session {} left telemedicine room {} (status={})", session.getId(), roomCode, status);
    }

    private void broadcastToOthers(WebSocketSession sender, String roomCode, SignalingMessage message) {
        CopyOnWriteArraySet<WebSocketSession> peers = rooms.get(roomCode);
        if (peers == null) {
            return;
        }

        try {
            String json = objectMapper.writeValueAsString(message);
            TextMessage textMessage = new TextMessage(json);
            for (WebSocketSession peer : peers) {
                if (!peer.getId().equals(sender.getId()) && peer.isOpen()) {
                    peer.sendMessage(textMessage);
                }
            }
        } catch (IOException e) {
            log.error("Failed to relay signaling message in room {}", roomCode, e);
        }
    }

    private String extractRoomCode(WebSocketSession session) {
        // URI path is /ws/telemedicine/{roomCode}
        String path = session.getUri() != null ? session.getUri().getPath() : "";
        String[] segments = path.split("/");
        return segments.length > 0 ? segments[segments.length - 1] : "unknown";
    }
}