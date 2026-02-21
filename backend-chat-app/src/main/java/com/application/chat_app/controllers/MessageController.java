package com.application.chat_app.controllers;

import com.application.chat_app.dto.MessageDTO;
import com.application.chat_app.service.ConversationService;
import com.application.chat_app.service.MessageService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/conversations/{conversationId}/messages")
public class MessageController {

    private final ConversationService conversationService;
    private final MessageService messageService;

    public MessageController(ConversationService conversationService,  MessageService messageService) {
        this.conversationService = conversationService;
        this.messageService = messageService;
    }

    @GetMapping
    public ResponseEntity<Page<MessageDTO>> getMessages(@PathVariable Long conversationId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MessageDTO> messages = conversationService.getConversationMessages(conversationId, pageable);
        return ResponseEntity.ok(messages);
    }
    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long messageId) {
        messageService.deleteMessage(messageId);
        return ResponseEntity.noContent().build();
    }
}
