package com.application.chat_app.service;

import com.application.chat_app.model.Block;
import com.application.chat_app.model.BlockId;
import com.application.chat_app.model.User;
import com.application.chat_app.repository.BlockRepository;
import com.application.chat_app.repository.UserRepository;
import com.application.chat_app.util.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BlockService {

    private final BlockRepository blockRepository;
    private final UserRepository userRepository;
    private final SecurityUtil securityUtil;

    public BlockService(BlockRepository blockRepository, UserRepository userRepository, SecurityUtil securityUtil) {
        this.blockRepository = blockRepository;
        this.userRepository = userRepository;
        this.securityUtil = securityUtil;
    }

    @Transactional
    public void blockUser(Long blockedUserId) {
        User blocker = securityUtil.getCurrentUser();

        if (blocker.getId().equals(blockedUserId)) {
            throw new IllegalArgumentException("You can't block yourself");
        }

        User blocked = userRepository.findById(blockedUserId)
                .orElseThrow(()-> new IllegalArgumentException("User not found"));

        BlockId blockId = new BlockId(blocker.getId(), blocked.getId());

        if(!blockRepository.existsById(blockId)) {
            Block block = new Block();
            block.setId(blockId);
            block.setBlocker(blocker);
            block.setBlocked(blocked);
            blockRepository.save(block);
        }
    }

    @Transactional
    public void unblockUser(Long blockedUserId) {
        User currentUser =  securityUtil.getCurrentUser();

        BlockId blockId1 = new BlockId(currentUser.getId(), blockedUserId);
        blockRepository.findById(blockId1).ifPresent(blockRepository::delete);

        BlockId blockId2 = new BlockId(blockedUserId, currentUser.getId());
        blockRepository.findById(blockId2).ifPresent(blockRepository::delete);
    }

    public boolean isBlocked(Long userId1, Long userId2) {
        return blockRepository.existsByBlockerIdAndBlockedId(userId1, userId2) ||
                blockRepository.existsByBlockerIdAndBlockedId(userId2, userId1);
    }
}
