package com.application.chat_app.dto;

import lombok.Data;

@Data
public class TypingPayload {
    private Long conversationId;
    private boolean isTyping;
}
