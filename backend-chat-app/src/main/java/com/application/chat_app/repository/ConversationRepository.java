package com.application.chat_app.repository;

import com.application.chat_app.model.Conversation;
import com.application.chat_app.projection.ConversationListView;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    @Query(value = """
        SELECT 
            c.id AS conversationId,
            u.id AS otherUserId,
            u.username AS otherUsername,
            u.email AS otherEmail,
            u.code AS otherCode,
            m.content AS lastMessageContent,
            m.created_at AS lastMessageTimestamp,
            m.sender_id AS lastMessageSenderId,
            (SELECT COUNT(*) FROM messages msg 
             WHERE msg.conversation_id = c.id 
               AND msg.sender_id != :currentUserId 
               AND msg.id > cp.last_read_message_id) AS unreadCount
        FROM conversation_participants cp
        JOIN conversations c ON cp.conversation_id = c.id
        JOIN conversation_participants cp_other ON c.id = cp_other.conversation_id AND cp_other.user_id != :currentUserId
        JOIN users u ON cp_other.user_id = u.id
        LEFT JOIN LATERAL (
            SELECT content, created_at, sender_id
            FROM messages
            WHERE conversation_id = c.id
            ORDER BY created_at DESC
            LIMIT 1
        ) m ON true
        WHERE cp.user_id = :currentUserId
        ORDER BY (unreadCount > 0) DESC, m.created_at DESC NULLS LAST
        """,
            countQuery = """
            SELECT COUNT(*)
            FROM conversation_participants cp
            WHERE cp.user_id = :currentUserId
            """,
            nativeQuery = true)
    Page<ConversationListView> findUserConversations(@Param("currentUserId") Long currentUserId, Pageable pageable);
}
