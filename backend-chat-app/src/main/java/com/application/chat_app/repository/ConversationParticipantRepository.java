package com.application.chat_app.repository;

import com.application.chat_app.model.Conversation;
import com.application.chat_app.model.ConversationParticipant;
import com.application.chat_app.model.ConversationParticipantId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.Set;

public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, ConversationParticipantId> {

    @Query("SELECT cp1.conversation FROM ConversationParticipant cp1 " +
                  "JOIN ConversationParticipant cp2 ON cp1.conversation = cp2.conversation " +
                  "WHERE cp1.user.id = :userId1 AND cp2.user.id = :userId2 AND cp1.conversation.type = 'DIRECT'")
    Optional<Conversation> findDirectConversationBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    @Query("SELECT cp FROM ConversationParticipant cp WHERE cp.conversation.id = :conversationId AND cp.user.id != :userId")
    Optional<ConversationParticipant> findByConversationIdAndUserIdNot(@Param("conversationId") Long conversationId, @Param("userId") Long userId);

    @Query("SELECT DISTINCT cp2.user.id FROM ConversationParticipant cp1 " +
            "JOIN ConversationParticipant cp2 ON cp1.conversation = cp2.conversation " +
            "WHERE cp1.user.id = :userId AND cp2.user.id != :userId")
    Set<Long> findDistinctUserIdsByConversationParticipant(@Param("userId") Long userId);
}
