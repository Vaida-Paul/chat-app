package com.application.chat_app.dto;

import lombok.Data;

@Data
public class MessagePayload {
    private Long conversationId;
    private String content;
}
