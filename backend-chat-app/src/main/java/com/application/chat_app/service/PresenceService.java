package com.application.chat_app.service;

import com.application.chat_app.repository.ConversationParticipantRepository;
import com.application.chat_app.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PresenceService {

    private final Map<Long, Set<String>> userSessions = new ConcurrentHashMap<>();

    private final UserRepository userRepository;

    private final ConversationParticipantRepository participantRepository;

    private final SimpMessagingTemplate messagingTemplate;

    public PresenceService(UserRepository userRepository, ConversationParticipantRepository participantRepository, SimpMessagingTemplate messagingTemplate) {
        this.userRepository = userRepository;
        this.participantRepository = participantRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public void userConnected(Long userId, String sessionId) {
        boolean wasOffline = !userSessions.containsKey(userId) || userSessions.get(userId).isEmpty();
        userSessions.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(sessionId);
        if (wasOffline) {
            notifyFriends(userId, true);
        }
    }

    public void userDisconnected(String sessionId) {
        for (Map.Entry<Long, Set<String>> entry : userSessions.entrySet()) {
            if (entry.getValue().remove(sessionId)) {
                if (entry.getValue().isEmpty()) {
                    userSessions.remove(entry.getKey());
                    notifyFriends(entry.getKey(), false);
                }
                break;
            }
        }
    }

    public boolean isUserOnline(Long userId) {
        return userSessions.containsKey(userId) && !userSessions.get(userId).isEmpty();
    }

    private void notifyFriends(Long userId, boolean online) {
        Set<Long> friendIds = participantRepository.findDistinctUserIdsByConversationParticipant(userId);
        for (Long friendId : friendIds) {
            userRepository.findById(friendId).ifPresent(friend -> {
                messagingTemplate.convertAndSendToUser(
                        friend.getEmail(),
                        "/queue/presence",
                        new PresenceEvent(userId, online)
                );
            });
        }
    }


    public static class PresenceEvent {
        private Long userId;
        private boolean online;

        public PresenceEvent(Long userId, boolean online) {
            this.userId = userId;
            this.online = online;
        }

        public Long getUserId() { return userId; }
        public boolean isOnline() { return online; }
    }
}