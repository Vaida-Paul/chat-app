package com.application.chat_app.listener;

import com.application.chat_app.service.PresenceService;
import com.application.chat_app.util.SecurityUtil;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {

    private final PresenceService presenceService;

    private final SecurityUtil securityUtils;

    public WebSocketEventListener(PresenceService presenceService, SecurityUtil securityUtils) {
        this.presenceService = presenceService;
        this.securityUtils = securityUtils;
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();

        if (headerAccessor.getUser() != null) {
            String email = headerAccessor.getUser().getName();
            securityUtils.getUserByEmail(email).ifPresent(user -> {
                presenceService.userConnected(user.getId(), sessionId);
            });
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        presenceService.userDisconnected(sessionId);
    }
}