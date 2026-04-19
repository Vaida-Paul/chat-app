package com.application.chat_app.controllers;

import com.application.chat_app.dto.UpdateUsernameRequest;
import com.application.chat_app.dto.UserDTO;
import com.application.chat_app.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe() {
        return ResponseEntity.ok(userService.getMe());
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDTO>> searchUsers(@RequestParam("q") String query) {
        List<UserDTO> users = userService.searchUsers(query);
        return ResponseEntity.ok(users);
    }

    @PatchMapping("/me")
    public ResponseEntity<UserDTO> updateCurrentUser(@Valid @RequestBody UpdateUsernameRequest request) {
        UserDTO updated = userService.updateUsername(request.getUsername());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<UserDTO> uploadAvatar(
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        return ResponseEntity.ok(userService.uploadAvatar(file));
    }

    @DeleteMapping("/me/avatar")
    public ResponseEntity<UserDTO> removeAvatar() throws IOException {
        return ResponseEntity.ok(userService.removeAvatar());
    }
}
