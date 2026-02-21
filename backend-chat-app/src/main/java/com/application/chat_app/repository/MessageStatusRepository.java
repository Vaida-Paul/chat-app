package com.application.chat_app.repository;

import com.application.chat_app.model.MessageStatus;
import com.application.chat_app.model.MessageStatusId;
import org.springframework.data.repository.CrudRepository;

public interface MessageStatusRepository extends CrudRepository<MessageStatus, MessageStatusId> {
}
