package com.accessibleconnect.backend.communication.livekit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/communication/sessions")
public class LiveKitController {

    @Autowired
    private LiveKitTokenService tokenService;

    @PostMapping("/{sessionId}/livekit-token")
    public ResponseEntity<LiveKitTokenResponse> getLiveKitToken(
            @PathVariable String sessionId,
            Principal principal
    ) {
        String email = principal.getName();
        LiveKitTokenResponse response = tokenService.generateToken(sessionId, email);
        return ResponseEntity.ok(response);
    }
}
