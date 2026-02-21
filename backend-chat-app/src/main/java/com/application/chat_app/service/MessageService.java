package com.application.chat_app.service;

import com.application.chat_app.dto.DeliveryReceiptPayload;
import com.application.chat_app.dto.MessageDTO;
import com.application.chat_app.dto.ReadReceiptPayload;
import com.application.chat_app.dto.TypingPayload;
import com.application.chat_app.model.*;
import com.application.chat_app.repository.*;
import com.application.chat_app.util.SecurityUtil;
import jakarta.persistence.EntityNotFoundException;
import org.hibernate.validator.internal.util.logging.Messages;
import org.springdoc.core.service.SecurityService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MessageService {

    private final MessageRepository messageRepository;

    private final MessageStatusRepository messageStatusRepository;

    private final ConversationRepository conversationRepository;

    private final UserRepository userRepository;

    private final ConversationParticipantRepository conversationParticipantRepository;

    private final BlockService blockService;

    private final SimpMessagingTemplate messagingTemplate;

    private final SecurityService securityService;

    private final ConversationParticipantRepository participantRepository;

    private final SecurityUtil securityUtil;

    public MessageService(MessageRepository messageRepository, MessageStatusRepository messageStatusRepository, ConversationRepository conversationRepository, UserRepository userRepository, ConversationParticipantRepository conversationParticipantRepository, BlockService blockService, SimpMessagingTemplate messagingTemplate, SecurityService securityService, ConversationParticipantRepository participantRepository,  SecurityUtil securityUtil) {
        this.messageRepository = messageRepository;
        this.messageStatusRepository = messageStatusRepository;
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
        this.conversationParticipantRepository = conversationParticipantRepository;
        this.blockService = blockService;
        this.messagingTemplate = messagingTemplate;
        this.securityService = securityService;
        this.participantRepository = participantRepository;
        this.securityUtil = securityUtil;
    }

    @Transactional
    public MessageDTO saveMessage(String senderEmail, Long conversationId, String content) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new EntityNotFoundException("Sender not found"));

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found"));

        ConversationParticipant recipientParticipant = participantRepository
                .findByConversationIdAndUserIdNot(conversationId, sender.getId())
                .orElseThrow(() -> new IllegalStateException("No recipient found in this conversation"));

        User recipient = recipientParticipant.getUser();

        if(blockService.isBlocked(sender.getId(),  recipient.getId())) {
            throw new IllegalStateException("Cannot send message: user is blocked");
        }
        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(content);
        message.setDeleted(false);
        message = messageRepository.save(message);


        MessageStatus status = new MessageStatus();
        status.setId(new MessageStatusId(message.getId(), recipient.getId()));
        status.setMessage(message);
        status.setUser(recipient);
        status.setStatus(MessageStatus.Status.SENT);
        messageStatusRepository.save(status);

        MessageDTO messageDTO = convertToDTO(message, sender, "SENT");


        messagingTemplate.convertAndSendToUser(
                recipient.getEmail(),
                "/queue/messages",
                messageDTO
        );

        return messageDTO;
    }

    @Transactional
    public void  markMessageAsDelivered(String receiveEmail, Long messageId) {
        User receiver = userRepository.findByEmail(receiveEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        MessageStatusId messageStatusId = new MessageStatusId(messageId, receiver.getId());
        MessageStatus status =  messageStatusRepository.findById(messageStatusId)
                .orElseThrow(() -> new EntityNotFoundException("Message status not found"));

        if (status.getStatus() == MessageStatus.Status.SENT) {
            status.setStatus(MessageStatus.Status.DELIVERED);
            messageStatusRepository.save(status);

            Message message = status.getMessage();
            messagingTemplate.convertAndSendToUser(
                    message.getSender().getEmail(),
                    "/queue/delivered",
                    new DeliveryReceiptPayload(messageId)
            );
        }
    }

    @Transactional
    public void markMessageAsRead(String readerEmail, ReadReceiptPayload payload) {
        User reader = userRepository.findByEmail(readerEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Conversation conversation = conversationRepository.findById(payload.getConversationId())
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found"));

        ConversationParticipantId  participantId = new ConversationParticipantId(conversation.getId(), reader.getId());

        ConversationParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new EntityNotFoundException("Participant not found"));
        participant.setLastReadMessageId(payload.getLastReadMessageId());
        participantRepository.save(participant);

        ConversationParticipant otherParticipant =  participantRepository
                .findByConversationIdAndUserIdNot(conversation.getId(), reader.getId())
                .orElseThrow(() -> new IllegalStateException("Participant not found"));

        User otherUser = otherParticipant.getUser();

        var messagesUpdates = messageRepository.findByConversationIdAndSenderIdAndIdLessThanEqual(conversation.getId(), otherUser.getId(), payload.getLastReadMessageId());

        for (Message msg : messagesUpdates) {
            MessageStatusId messageStatusId = new MessageStatusId(msg.getId(), reader.getId());
            MessageStatus status = messageStatusRepository.findById(messageStatusId).orElse(null);
            if (status != null && status.getStatus() !=  MessageStatus.Status.READ) {
                status.setStatus(MessageStatus.Status.READ);
                messageStatusRepository.save(status);
            }

        }
        messagingTemplate.convertAndSendToUser(
                otherUser.getEmail(),
                "/queue/read",
                payload
        );

    }

    @Transactional
    public void handleTyping(String senderEmail, TypingPayload payload) {
        User sender =  userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new EntityNotFoundException("Sender not found"));

        Conversation conversation = conversationRepository.findById(payload.getConversationId())
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found"));

        ConversationParticipant recipientParticipant = participantRepository
                .findByConversationIdAndUserIdNot(conversation.getId(), sender.getId())
                .orElseThrow(() -> new IllegalStateException("No recipient found in this conversation"));

        User recipient = recipientParticipant.getUser();

        messagingTemplate.convertAndSendToUser(
                recipient.getEmail(),
                "/queue/typing",
                payload
        );
    }

    @Transactional
    public void deleteMessage(Long messageId) {
        User currentUser = securityUtil.getCurrentUser();
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new EntityNotFoundException("Message not found"));

        if(!message.getSender().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only delete your own message");
        }

        message.setDeleted(true);
        message.setContent(null);
        messageRepository.save(message);
    }

    private MessageDTO convertToDTO(Message message, User sender, String status) {
        return new MessageDTO(
                message.getId(),
                message.isDeleted() ? null : message.getContent(),
                sender.getId(),
                sender.getUsername(),
                message.getCreatedAt(),
                message.isDeleted(),
                status
        );
    }
}
