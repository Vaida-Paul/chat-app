package com.application.chat_app.service;

import com.application.chat_app.dto.ConversationDTO;
import com.application.chat_app.dto.MessageDTO;
import com.application.chat_app.dto.UserDTO;
import com.application.chat_app.mapper.UserMapper;
import com.application.chat_app.model.*;
import com.application.chat_app.projection.ConversationListView;
import com.application.chat_app.repository.*;
import com.application.chat_app.util.SecurityUtil;
import jakarta.persistence.EntityNotFoundException;
import org.springdoc.core.service.SecurityService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final BlockRepository blockRepository;
    private final SecurityUtil securityUtil;
    private final MessageRepository messageRepository;
    private final MessageStatusRepository messageStatusRepository;

    public ConversationService(ConversationRepository conversationRepository, ConversationParticipantRepository participantRepository, UserRepository userRepository, BlockRepository blockRepository, SecurityUtil securityUtil,  MessageRepository messageRepository,  MessageStatusRepository messageStatusRepository) {
        this.conversationRepository = conversationRepository;
        this.participantRepository = participantRepository;
        this.userRepository = userRepository;
        this.blockRepository = blockRepository;
        this.securityUtil = securityUtil;
        this.messageRepository = messageRepository;
        this.messageStatusRepository = messageStatusRepository;
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


        Message lastMsg = messageRepository.findFirstByConversationIdOrderByCreatedAtDesc(conversation.getId()).orElse(null);
        MessageDTO lastMessageDTO = lastMsg != null ?
                new MessageDTO(lastMsg.getId(), lastMsg.getContent(), lastMsg.getSender().getId(),
                        lastMsg.getSender().getUsername(), lastMsg.getSender().getAvatarUrl(), lastMsg.getCreatedAt(), lastMsg.isDeleted(), null, conversation.getId(), lastMsg.getAttachmentUrl(), lastMsg.getAttachmentType()) : null;

        long unreadCount = 0;
        LocalDateTime lastMsgTime = lastMsg != null ? lastMsg.getCreatedAt() : null;

        return new ConversationDTO(
                conversation.getId(),
                otherUserDTO,
                lastMessageDTO,
                unreadCount,
                lastMsgTime,
                otherUser.getAvatarUrl()
        );
    }
    public Page<ConversationDTO> getUserConversations(Pageable pageable) {
        User currentUser =  securityUtil.getCurrentUser();
        Page<ConversationListView> page = conversationRepository.findUserConversations(currentUser.getId(), pageable);
        return page.map(this::convertToDTO);
    }
    private ConversationDTO convertToDTO(ConversationListView view) {
        UserDTO otherUser = new UserDTO(
                view.getOtherUserId(),
                view.getOtherUsername(),
                view.getOtherEmail(),
                view.getOtherCode(),
                false,
                view.getAvatarUrl()
        );


        MessageDTO lastMessage = null;
        if (view.getLastMessageContent() != null) {
            lastMessage = new MessageDTO(
                    null,
                    view.getLastMessageContent(),
                    view.getLastMessageSenderId(),
                    null,
                    view.getAvatarUrl(),
                    view.getLastMessageTimestamp(),
                    false,
                    null,
                    view.getConversationId(),
                    null,
                    null
            );
        }

        return new ConversationDTO(
                view.getConversationId(),
                otherUser,
                lastMessage,
                view.getUnreadCount(),
                view.getLastMessageTimestamp(),
                view.getAvatarUrl()
        );


    }

public Page<MessageDTO> getConversationMessages(Long conversationId, Pageable page) {
    User currentUser = securityUtil.getCurrentUser();
    ConversationParticipantId participantId =
            new ConversationParticipantId(conversationId, currentUser.getId());

    if (!participantRepository.existsById(participantId)) {
        throw new EntityNotFoundException("Participant not found");
    }


    ConversationParticipant otherParticipant = participantRepository
            .findByConversationIdAndUserIdNot(conversationId, currentUser.getId())
            .orElse(null);

    Page<Message> messagePage = messageRepository
            .findByConversationIdOrderByCreatedAtDesc(conversationId, page);

    return messagePage.map(message -> {
        boolean isMine = message.getSender().getId().equals(currentUser.getId());
        String status = "SENT";

        if (isMine && otherParticipant != null) {

            MessageStatusId statusId = new MessageStatusId(
                    otherParticipant.getUser().getId(),
                    message.getId()
            );
            MessageStatus messageStatus = messageStatusRepository.findById(statusId).orElse(null);
            status = messageStatus != null ? messageStatus.getStatus().name() : "SENT";
        } else {

            status = null;
        }

        return new MessageDTO(
                message.getId(),
                message.isDeleted() ? null : message.getContent(),
                message.getSender().getId(),
                message.getSender().getUsername(),
                message.getSender().getAvatarUrl(),
                message.getCreatedAt(),
                message.isDeleted(),
                status,
                conversationId,
                message.getAttachmentUrl(),
                message.getAttachmentType()
        );
    });
}
}
