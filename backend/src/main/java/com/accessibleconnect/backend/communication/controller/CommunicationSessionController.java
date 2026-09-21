package com.accessibleconnect.backend.communication.controller;

import com.accessibleconnect.backend.communication.dto.CreateCommunicationSessionRequest;
import com.accessibleconnect.backend.communication.dto.CommunicationSessionResponse;
import com.accessibleconnect.backend.communication.service.CommunicationSessionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.beans.factory.annotation.Value;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/communication/sessions")
public class CommunicationSessionController {

    @Autowired
    private CommunicationSessionService sessionService;

    @PostMapping
    public ResponseEntity<CommunicationSessionResponse> createSession(
            @Valid @RequestBody CreateCommunicationSessionRequest request,
            Principal principal
    ) {
        String email = principal.getName();
        CommunicationSessionResponse response = sessionService.createSession(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<CommunicationSessionResponse>> getSessions(Principal principal) {
        String email = principal.getName();
        List<CommunicationSessionResponse> responses = sessionService.getSessionsForUser(email);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/by-code/{roomCode}")
    public ResponseEntity<CommunicationSessionResponse> getSessionByRoomCode(
            @PathVariable String roomCode,
            Principal principal
    ) {
        String email = principal.getName();
        CommunicationSessionResponse response = sessionService.getSessionByRoomCode(roomCode, email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommunicationSessionResponse> getSession(
            @PathVariable String id,
            Principal principal
    ) {
        String email = principal.getName();
        try {
            UUID uuid = UUID.fromString(id);
            return ResponseEntity.ok(sessionService.getSession(uuid, email));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.ok(sessionService.getSessionByRoomCode(id, email));
        }
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<CommunicationSessionResponse> startSession(
            @PathVariable String id,
            Principal principal
    ) {
        String email = principal.getName();
        UUID uuid;
        try {
            uuid = UUID.fromString(id);
        } catch (IllegalArgumentException e) {
            CommunicationSessionResponse resp = sessionService.getSessionByRoomCode(id, email);
            uuid = resp.getId();
        }
        CommunicationSessionResponse response = sessionService.startSession(uuid, email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<CommunicationSessionResponse> endSession(
            @PathVariable String id,
            Principal principal
    ) {
        String email = principal.getName();
        UUID uuid;
        try {
            uuid = UUID.fromString(id);
        } catch (IllegalArgumentException e) {
            CommunicationSessionResponse resp = sessionService.getSessionByRoomCode(id, email);
            uuid = resp.getId();
        }
        CommunicationSessionResponse response = sessionService.endSession(uuid, email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<CommunicationSessionResponse> cancelSession(
            @PathVariable String id,
            Principal principal
    ) {
        String email = principal.getName();
        UUID uuid;
        try {
            uuid = UUID.fromString(id);
        } catch (IllegalArgumentException e) {
            CommunicationSessionResponse resp = sessionService.getSessionByRoomCode(id, email);
            uuid = resp.getId();
        }
        CommunicationSessionResponse response = sessionService.cancelSession(uuid, email);
        return ResponseEntity.ok(response);
    }

    @Value("${app.sign-sequence.unsupported-pause-ms:1500}")
    private int unsupportedPauseMs;

    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfig() {
        return ResponseEntity.ok(Map.of(
            "unsupportedPauseMs", unsupportedPauseMs
        ));
    }
}
