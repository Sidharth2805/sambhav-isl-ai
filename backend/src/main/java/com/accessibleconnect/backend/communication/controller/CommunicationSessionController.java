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

    @PostMapping("/join/{roomCode}")
    public ResponseEntity<CommunicationSessionResponse> joinSession(
            @PathVariable String roomCode,
            Principal principal
    ) {
        String email = principal.getName();
        CommunicationSessionResponse response = sessionService.joinSessionByRoomCode(roomCode, email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-code/{roomCode}")
    public ResponseEntity<CommunicationSessionResponse> getSessionByRoomCode(
            @PathVariable String roomCode,
            Principal principal
    ) {
        String email = principal.getName();
        CommunicationSessionResponse response = sessionService.joinSessionByRoomCode(roomCode, email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommunicationSessionResponse> getSession(
            @PathVariable String id,
            Principal principal
    ) {
        String email = principal.getName();
        return ResponseEntity.ok(sessionService.getSessionByIdentifier(id, email));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<CommunicationSessionResponse> startSession(
            @PathVariable String id,
            Principal principal
    ) {
        String email = principal.getName();
        CommunicationSessionResponse response = sessionService.startSessionByIdentifier(id, email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<CommunicationSessionResponse> endSession(
            @PathVariable String id,
            Principal principal
    ) {
        String email = principal.getName();
        CommunicationSessionResponse response = sessionService.endSessionByIdentifier(id, email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<CommunicationSessionResponse> cancelSession(
            @PathVariable String id,
            Principal principal
    ) {
        String email = principal.getName();
        CommunicationSessionResponse response = sessionService.cancelSessionByIdentifier(id, email);
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
