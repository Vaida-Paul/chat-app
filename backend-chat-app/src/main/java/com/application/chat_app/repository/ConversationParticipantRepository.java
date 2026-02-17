package com.application.chat_app.repository;

import com.application.chat_app.model.Conversation;
import com.application.chat_app.model.ConversationParticipant;
import com.application.chat_app.model.ConversationParticipantId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, ConversationParticipantId> {

    @Query("SELECT cp1.conversation FROM ConversationParticipant cp1 " +
            "JOIN ConversationParticipant cp2 ON cp1.conversation = cp2.conversation " +
            "WHERE cp1.user.id = :userId1 AND cp2.user.id = :userId2 AND cp1.conversation.type = 'DIRECT'")
    Optional<Conversation> findDirectConversationBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}
