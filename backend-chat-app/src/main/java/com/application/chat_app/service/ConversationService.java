package com.application.chat_app.service;

import com.application.chat_app.dto.ConversationDTO;
import com.application.chat_app.dto.MessageDTO;
import com.application.chat_app.dto.UserDTO;
import com.application.chat_app.mapper.UserMapper;
import com.application.chat_app.model.Conversation;
import com.application.chat_app.model.ConversationParticipant;
import com.application.chat_app.model.ConversationParticipantId;
import com.application.chat_app.model.User;
import com.application.chat_app.repository.BlockRepository;
import com.application.chat_app.repository.ConversationParticipantRepository;
import com.application.chat_app.repository.ConversationRepository;
import com.application.chat_app.repository.UserRepository;
import com.application.chat_app.util.SecurityUtil;
import jakarta.persistence.EntityNotFoundException;
import org.springdoc.core.service.SecurityService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final BlockRepository blockRepository;
    private final SecurityUtil securityUtil;

    public ConversationService(ConversationRepository conversationRepository, ConversationParticipantRepository participantRepository, UserRepository userRepository, BlockRepository blockRepository, SecurityUtil securityUtil) {
        this.conversationRepository = conversationRepository;
        this.participantRepository = participantRepository;
        this.userRepository = userRepository;
        this.blockRepository = blockRepository;
        this.securityUtil = securityUtil;
    }

    @Transactional
    public ConversationDTO createConversation(Long recipientId) {
        User currentUser = securityUtil.getCurrentUser();
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new EntityNotFoundException("Recipient not found"));

        if (isBlocked(currentUser.getId(), recipientId)) {
            throw new IllegalStateException("Cannot start conversation: user is blocked");
        }

        Optional<Conversation> existingConv = participantRepository.findDirectConversationBetweenUsers(
                currentUser.getId(), recipientId);
        if (existingConv.isPresent()) {
            return buildConversationDTO(existingConv.get(), currentUser, recipient);
        }

        Conversation conversation = new Conversation();
        conversation.setType(Conversation.ConversationType.DIRECT);
        conversation = conversationRepository.save(conversation);

        addParticipant(conversation, currentUser);
        addParticipant(conversation, recipient);

        return buildConversationDTO(conversation, currentUser, recipient);
    }

    private void addParticipant(Conversation conversation, User user) {
        ConversationParticipant participant = new ConversationParticipant();
        participant.setId(new ConversationParticipantId(conversation.getId(), user.getId()));
        participant.setConversation(conversation);
        participant.setUser(user);
        participant.setLastReadMessageId(null);
        participant.setNotificationEnabled(true);
        participantRepository.save(participant);
    }

    private boolean isBlocked(Long userId1, Long userId2) {
        return blockRepository.existsByBlockerIdAndBlockedId(userId1, userId2) ||
                blockRepository.existsByBlockerIdAndBlockedId(userId2, userId1);
    }

    private ConversationDTO buildConversationDTO(Conversation conversation, User currentUser, User otherUser) {
        UserDTO otherUserDTO = UserMapper.userToUserDTO(otherUser);

        MessageDTO lastMessage = null;
        long unreadCount = 0;
        LocalDateTime lastMessageTimestamp = null;


        return new ConversationDTO(
                conversation.getId(),
                otherUserDTO,
                lastMessage,
                unreadCount,
                lastMessageTimestamp
        );
    }
}
