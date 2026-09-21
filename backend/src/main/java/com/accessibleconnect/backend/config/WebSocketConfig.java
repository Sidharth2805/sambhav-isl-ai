package com.accessibleconnect.backend.config;

import com.accessibleconnect.backend.communication.stt.handler.TranscriptWebSocketHandler;
import com.accessibleconnect.backend.communication.webrtc.WebRtcSignalingWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final TranscriptWebSocketHandler transcriptWebSocketHandler;
    private final WebRtcSignalingWebSocketHandler webRtcSignalingWebSocketHandler;

    public WebSocketConfig(
            TranscriptWebSocketHandler transcriptWebSocketHandler,
            WebRtcSignalingWebSocketHandler webRtcSignalingWebSocketHandler
    ) {
        this.transcriptWebSocketHandler = transcriptWebSocketHandler;
        this.webRtcSignalingWebSocketHandler = webRtcSignalingWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(transcriptWebSocketHandler, "/ws/session")
                .setAllowedOrigins("*");
        registry.addHandler(webRtcSignalingWebSocketHandler, "/ws/webrtc")
                .setAllowedOrigins("*");
    }
}
