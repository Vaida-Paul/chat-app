package com.application.chat_app.controllers;

import com.application.chat_app.dto.*;
import com.application.chat_app.service.MessageService;
import com.application.chat_app.util.SecurityUtil;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {
    private final SecurityUtil securityUtil;
    private final MessageService messageService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    public ChatController(SecurityUtil securityUtil, MessageService messageService, SimpMessagingTemplate simpMessagingTemplate) {
        this.securityUtil = securityUtil;
        this.messageService = messageService;
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    @MessageMapping("/chat.send")
    public void sendMessage(MessagePayload payload, SimpMessageHeaderAccessor headerAccessor) {
        String senderEmail = headerAccessor.getUser().getName();
        MessageDTO savedMessage = messageService.saveMessage(senderEmail, payload.getConversationId(), payload.getContent());
    }

    @MessageMapping("/chat.typing")
    public void typingIndicator(TypingPayload payload, SimpMessageHeaderAccessor headerAccessor) {
        String senderEmail = headerAccessor.getUser().getName();
        messageService.handleTyping(senderEmail, payload);
    }

    @MessageMapping("/chat.read")
    public void markAsRead(ReadReceiptPayload payload, SimpMessageHeaderAccessor headerAccessor) {
        String readerEmail = headerAccessor.getUser().getName();
        messageService.markMessageAsRead(readerEmail, payload);
    }

    @MessageMapping("/chat.delivered")
    public void markAsDelivered(DeliveryReceiptPayload payload, SimpMessageHeaderAccessor headerAccessor) {
        String receiverEmail = headerAccessor.getUser().getName();
        messageService.markMessageAsDelivered(receiverEmail,payload.getMessageId());
    }
}
