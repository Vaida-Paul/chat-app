package com.application.chat_app.controllers;

import com.application.chat_app.dto.PresenceStatusDTO;
import com.application.chat_app.model.User;
import com.application.chat_app.repository.ConversationParticipantRepository;
import com.application.chat_app.repository.UserRepository;
import com.application.chat_app.service.PresenceService;
import com.application.chat_app.util.SecurityUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/presence")
public class PresenceController {

    private final PresenceService presenceService;

    private final SecurityUtil securityUtils;

    private final ConversationParticipantRepository participantRepository;

    private final UserRepository userRepository;

    public PresenceController(PresenceService presenceService, SecurityUtil securityUtils, ConversationParticipantRepository participantRepository, UserRepository userRepository) {
        this.presenceService = presenceService;
        this.securityUtils = securityUtils;
        this.participantRepository = participantRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<PresenceStatusDTO> getUserStatus(@PathVariable Long userId) {
        User currentUser = securityUtils.getCurrentUser();
        boolean shareConversation = participantRepository.findDirectConversationBetweenUsers(currentUser.getId(), userId).isPresent();

        if (!shareConversation && !currentUser.getId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        boolean online = presenceService.isUserOnline(userId);
        return ResponseEntity.ok(new PresenceStatusDTO(userId, online));
    }

    @GetMapping("/friends")
    public ResponseEntity<List<PresenceStatusDTO>> getFriendsStatus() {
        User currentUser = securityUtils.getCurrentUser();

        List<Long> friendIds = participantRepository.findDistinctUserIdsByConversationParticipant(currentUser.getId())
                .stream().collect(Collectors.toList());

        List<PresenceStatusDTO> statuses = friendIds.stream()
                .map(id -> new PresenceStatusDTO(id, presenceService.isUserOnline(id)))
                .collect(Collectors.toList());

        return ResponseEntity.ok(statuses);
    }
}