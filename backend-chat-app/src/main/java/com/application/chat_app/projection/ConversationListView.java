package com.application.chat_app.projection;

import java.time.LocalDateTime;

public interface ConversationListView {
    Long getConversationId();
    Long getOtherUserId();
    String getOtherUsername();
    String getOtherEmail();
    String getOtherCode();
    String getLastMessageContent();
    LocalDateTime getLastMessageTimestamp();
    Long getLastMessageSenderId();
    Long getUnreadCount();
}