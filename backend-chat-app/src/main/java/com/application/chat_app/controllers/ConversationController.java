package com.application.chat_app.controllers;

import com.application.chat_app.dto.ConversationDTO;
import com.application.chat_app.dto.CreateConversationRequest;
import com.application.chat_app.service.ConversationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    private final ConversationService conversationService;
    public ConversationController(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    @PostMapping
    public ResponseEntity<ConversationDTO> createConversation(@Valid @RequestBody CreateConversationRequest request) {
        ConversationDTO conversation = conversationService.createConversation(request.getRecipientId());
        return new ResponseEntity<>(conversation, HttpStatus.CREATED);
    }
}
