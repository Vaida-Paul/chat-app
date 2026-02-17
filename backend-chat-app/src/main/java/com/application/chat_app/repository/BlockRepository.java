package com.application.chat_app.repository;

import com.application.chat_app.model.Block;
import com.application.chat_app.model.BlockId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlockRepository extends JpaRepository<Block, BlockId> {

    boolean existsByBlockerIdAndBlockedId(Long blockerId, Long blockedId);

}
