package com.application.chat_app.repository;

import com.application.chat_app.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message,Long> {
    Page<Message> findByConversationIdOrderByCreatedAtDesc(Long conversationId, Pageable pageable);
    List<Message> findByConversationIdAndSenderIdAndIdLessThanEqual(Long conversationId, Long senderId, Long maxId);
    Optional<Message> findFirstByConversationIdOrderByCreatedAtDesc(Long conversationId);
}
