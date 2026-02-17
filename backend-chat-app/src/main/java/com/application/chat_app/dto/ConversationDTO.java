package com.application.chat_app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConversationDTO {

    private Long id;
    private UserDTO otherUser;
    private MessageDTO lastMessage;
    private Long unreadCount;
    private LocalDateTime lastMessageTimestamp;
}
