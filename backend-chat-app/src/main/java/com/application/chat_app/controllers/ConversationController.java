package com.application.chat_app.controllers;

import com.application.chat_app.dto.ConversationDTO;
import com.application.chat_app.dto.CreateConversationRequest;
import com.application.chat_app.service.ConversationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping
    public ResponseEntity<Page<ConversationDTO>> getConversations(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "lastMessageTimestamp"));

        Page<ConversationDTO> conversation = conversationService.getUserConversations(pageable);
        return ResponseEntity.ok(conversation);
    }
}