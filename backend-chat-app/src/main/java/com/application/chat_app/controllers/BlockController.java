package com.application.chat_app.controllers;

import com.application.chat_app.service.BlockService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/block")
public class BlockController {

    private final BlockService blockService;
    public BlockController(BlockService blockService) {
        this.blockService = blockService;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<Void> blockUser(@PathVariable Long userId) {
        blockService.blockUser(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> unblockUser(@PathVariable Long userId) {
        blockService.unblockUser(userId);
        return ResponseEntity.ok().build();
    }
}
