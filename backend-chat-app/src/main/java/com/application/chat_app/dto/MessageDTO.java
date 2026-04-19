package com.application.chat_app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageDTO {
    private Long id;
    private String content;
    private Long senderId;
    private String senderUsername;
    private String senderAvatarUrl;
    private LocalDateTime createdAt;
    private boolean deleted = false;
    private String status;
    private Long conversationId;
    private String attachmentUrl;
    private String attachmentType;
}
