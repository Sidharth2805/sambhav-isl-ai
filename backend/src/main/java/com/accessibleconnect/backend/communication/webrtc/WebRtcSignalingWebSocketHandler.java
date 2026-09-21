package com.accessibleconnect.backend.communication.webrtc;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebRtcSignalingWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(WebRtcSignalingWebSocketHandler.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    // Map: roomId -> Set of WebSocketSessions
    private final Map<String, Set<WebSocketSession>> rooms = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("[WebRTC Signaling] New connection established: id={}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        try {
            String payload = message.getPayload();
            JsonNode root = objectMapper.readTree(payload);

            String type = root.path("type").asText("");

            if ("join".equalsIgnoreCase(type)) {
                handleJoin(session, root);
            } else if ("signal".equalsIgnoreCase(type)) {
                handleSignal(session, root, payload);
            } else if ("app-message".equalsIgnoreCase(type)) {
                handleAppMessage(session, root, payload);
            } else if ("leave".equalsIgnoreCase(type)) {
                handleLeave(session);
            }
        } catch (Exception e) {
            log.error("[WebRTC Signaling] Error handling text message: ", e);
        }
    }

    private void handleJoin(WebSocketSession session, JsonNode root) throws IOException {
        String roomId = root.path("roomId").asText("").trim().toUpperCase();
        String role = root.path("role").asText("normal");

        if (roomId.isEmpty()) {
            sendJson(session, Map.of("type", "error", "error", "Room ID is required."));
            return;
        }

        session.getAttributes().put("roomId", roomId);
        session.getAttributes().put("role", role);

        Set<WebSocketSession> room = rooms.computeIfAbsent(roomId, k -> Collections.newSetFromMap(new ConcurrentHashMap<>()));

        if (room.size() >= 2 && !room.contains(session)) {
            log.warn("[WebRTC Signaling] Room {} is full. Rejecting session {}", roomId, session.getId());
            sendJson(session, Map.of("type", "room-full", "roomId", roomId));
            return;
        }

        boolean isInitiator = room.isEmpty();
        room.add(session);

        log.info("[WebRTC Signaling] User joined room={}, role={}, size={}, isInitiator={}", roomId, role, room.size(), isInitiator);

        sendJson(session, Map.of(
                "type", "joined",
                "roomId", roomId,
                "role", role,
                "initiator", isInitiator,
                "peerCount", room.size()
        ));

        if (room.size() == 2) {
            for (WebSocketSession peer : room) {
                if (!peer.getId().equals(session.getId())) {
                    sendJson(peer, Map.of(
                            "type", "peer-joined",
                            "initiator", true,
                            "role", role
                    ));
                } else {
                    String existingRole = (String) peer.getAttributes().getOrDefault("role", "normal");
                    sendJson(peer, Map.of(
                            "type", "peer-joined",
                            "initiator", false,
                            "role", existingRole
                    ));
                }
            }
        }
    }

    private void handleSignal(WebSocketSession session, JsonNode root, String rawPayload) {
        String roomId = (String) session.getAttributes().get("roomId");
        if (roomId == null) {
            roomId = root.path("roomId").asText("").trim().toUpperCase();
        }
        if (roomId.isEmpty()) return;

        Set<WebSocketSession> room = rooms.get(roomId);
        if (room == null) return;

        TextMessage msg = new TextMessage(rawPayload);
        for (WebSocketSession peer : room) {
            if (!peer.getId().equals(session.getId()) && peer.isOpen()) {
                try {
                    synchronized (peer) {
                        peer.sendMessage(msg);
                    }
                } catch (IOException e) {
                    log.error("[WebRTC Signaling] Failed to relay signal to peer {}", peer.getId(), e);
                }
            }
        }
    }

    private void handleAppMessage(WebSocketSession session, JsonNode root, String rawPayload) {
        String roomId = (String) session.getAttributes().get("roomId");
        if (roomId == null) {
            roomId = root.path("roomId").asText("").trim().toUpperCase();
        }
        if (roomId.isEmpty()) return;

        Set<WebSocketSession> room = rooms.get(roomId);
        if (room == null) return;

        TextMessage msg = new TextMessage(rawPayload);
        for (WebSocketSession peer : room) {
            if (!peer.getId().equals(session.getId()) && peer.isOpen()) {
                try {
                    synchronized (peer) {
                        peer.sendMessage(msg);
                    }
                } catch (IOException e) {
                    log.error("[WebRTC Signaling] Failed to relay app-message to peer {}", peer.getId(), e);
                }
            }
        }
    }

    private void handleLeave(WebSocketSession session) {
        String roomId = (String) session.getAttributes().get("roomId");
        if (roomId == null) return;

        Set<WebSocketSession> room = rooms.get(roomId);
        if (room != null) {
            room.remove(session);
            log.info("[WebRTC Signaling] Session {} left room {}, remaining={}", session.getId(), roomId, room.size());

            for (WebSocketSession peer : room) {
                if (peer.isOpen()) {
                    try {
                        sendJson(peer, Map.of("type", "peer-left", "roomId", roomId));
                    } catch (Exception ignored) {}
                }
            }

            if (room.isEmpty()) {
                rooms.remove(roomId);
            }
        }

        session.getAttributes().remove("roomId");
        session.getAttributes().remove("role");
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        log.info("[WebRTC Signaling] Connection closed: id={}, status={}", session.getId(), status);
        handleLeave(session);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.warn("[WebRTC Signaling] Transport error for id={}: {}", session.getId(), exception.getMessage());
        handleLeave(session);
    }

    private void sendJson(WebSocketSession session, Map<String, Object> data) throws IOException {
        if (session.isOpen()) {
            synchronized (session) {
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(data)));
            }
        }
    }
}
