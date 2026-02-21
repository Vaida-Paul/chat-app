package com.application.chat_app.dto;

import lombok.Data;

@Data
public class ReadReceiptPayload {
    private Long conversationId;
    private Long lastReadMessageId;
}
