package com.accessibleconnect.backend.communication.livekit;

import com.accessibleconnect.backend.communication.entity.CommunicationMode;
import com.accessibleconnect.backend.communication.entity.CommunicationSession;
import com.accessibleconnect.backend.communication.entity.CommunicationSessionStatus;
import com.accessibleconnect.backend.communication.exception.InvalidSessionStateException;
import com.accessibleconnect.backend.communication.exception.SessionNotFoundException;
import com.accessibleconnect.backend.communication.repository.CommunicationSessionRepository;
import com.accessibleconnect.backend.user.entity.AccountType;
import com.accessibleconnect.backend.user.entity.User;
import com.accessibleconnect.backend.user.repository.UserRepository;
import io.livekit.server.AccessToken;
import io.livekit.server.CanPublish;
import io.livekit.server.CanPublishData;
import io.livekit.server.CanSubscribe;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class LiveKitTokenServiceImpl implements LiveKitTokenService {

    @Autowired
    private CommunicationSessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LiveKitConfig liveKitConfig;

    @Autowired
    private com.accessibleconnect.backend.admin.service.CommunicationAuditService auditService;

    @Override
    @Transactional
    public LiveKitTokenResponse generateToken(UUID sessionId, String userEmail) {
        return generateToken(sessionId.toString(), userEmail);
    }

    @Override
    @Transactional
    public LiveKitTokenResponse generateToken(String sessionIdentifier, String userEmail) {
        if (sessionIdentifier == null || sessionIdentifier.trim().isEmpty()) {
            throw new SessionNotFoundException("Session identifier cannot be blank.");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found: " + userEmail));

        CommunicationSession session = resolveSession(sessionIdentifier.trim());

        // 1. Verify that the session mode is ONLINE
        if (session.getMode() != CommunicationMode.ONLINE) {
            throw new InvalidSessionStateException("Cannot request LiveKit credentials for an OFFLINE session.");
        }

        // 2. Reject CANCELLED or ENDED sessions
        if (session.getStatus() == CommunicationSessionStatus.ENDED || 
            session.getStatus() == CommunicationSessionStatus.CANCELLED) {
            throw new InvalidSessionStateException("Cannot obtain a token for an ended or cancelled session.");
        }

        // 3. Enforce Account Type Pairing & Participant Registration
        if (!session.getCreator().getId().equals(user.getId())) {
            AccountType creatorType = session.getCreator().getAccountType();
            AccountType joinerType = user.getAccountType();

            if (creatorType != AccountType.ADMIN && joinerType != AccountType.ADMIN) {
                if (creatorType == joinerType) {
                    throw new InvalidSessionStateException(
                        "Invalid account pairing: Video calls must be between a Common User and an Accessibility User. Both participants cannot be " + joinerType.name() + "."
                    );
                }
            }

            if (session.getParticipant() == null) {
                session.setParticipant(user);
                if (session.getStatus() == CommunicationSessionStatus.CREATED) {
                    session.setStatus(CommunicationSessionStatus.WAITING);
                }
                sessionRepository.save(session);
            } else if (!session.getParticipant().getId().equals(user.getId()) && joinerType != AccountType.ADMIN) {
                throw new InvalidSessionStateException("This room is already full (maximum 2 participants).");
            }
        }

        // 4. Verify LiveKit configuration values are valid
        String apiKey = liveKitConfig.getApiKey();
        String apiSecret = liveKitConfig.getApiSecret();
        String url = liveKitConfig.getUrl();
        if (apiKey == null || apiKey.trim().isEmpty() ||
            apiSecret == null || apiSecret.trim().isEmpty()) {
            throw new IllegalStateException("LiveKit API Key or API Secret is not configured on the server.");
        }

        // 5. Generate token using official LiveKit SDK AccessToken for the authoritative room code
        AccessToken token = new AccessToken(apiKey, apiSecret);
        token.setIdentity(user.getEmail());
        token.setName(user.getName());
        token.setTtl(3600000L); // Token valid for 1 hour (in milliseconds)

        // Grant comprehensive room permissions
        token.addGrants(
                new RoomJoin(true),
                new RoomName(session.getRoomCode()),
                new CanPublish(true),
                new CanSubscribe(true),
                new CanPublishData(true)
        );

        auditService.logEvent(userEmail, "LIVEKIT_TOKEN_GEN", session.getId(), "SUCCESS", "Room Code: " + session.getRoomCode() + ", Identity: " + user.getEmail(), null);
        return new LiveKitTokenResponse(
                url,
                token.toJwt(),
                session.getRoomCode(),
                user.getEmail()
        );
    }

    private CommunicationSession resolveSession(String identifier) {
        String clean = identifier.trim();
        try {
            UUID uuid = UUID.fromString(clean);
            return sessionRepository.findById(uuid)
                    .orElseGet(() -> sessionRepository.findByRoomCode(clean.toUpperCase())
                            .orElseThrow(() -> new SessionNotFoundException("Communication session not found with ID: " + clean)));
        } catch (IllegalArgumentException e) {
            return sessionRepository.findByRoomCode(clean.toUpperCase())
                    .orElseThrow(() -> new SessionNotFoundException("Communication session not found with room code: " + clean));
        }
    }
}
