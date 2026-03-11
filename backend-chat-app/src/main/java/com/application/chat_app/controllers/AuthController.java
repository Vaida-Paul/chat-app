package com.application.chat_app.controllers;

import com.application.chat_app.dto.AuthResponse;
import com.application.chat_app.dto.LoginRequest;
import com.application.chat_app.dto.RegisterRequest;
import com.application.chat_app.dto.UserDTO;
import com.application.chat_app.mapper.UserMapper;
import com.application.chat_app.model.User;
import com.application.chat_app.service.AuthService;
import com.application.chat_app.service.TurnstileService;
import com.application.chat_app.util.SecurityUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentification", description = "Authentification endpoints")
public class AuthController {
    private final AuthService authService;
    private final SecurityUtil securityUtil;
    private final TurnstileService turnstileService;

    public AuthController(AuthService authService, SecurityUtil securityUtil, TurnstileService turnstileService) {
        this.authService = authService;
        this.securityUtil = securityUtil;
        this.turnstileService = turnstileService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request,
                                                 jakarta.servlet.http.HttpServletRequest httpRequest) {
        boolean captchaOk = turnstileService.verifyToken(
                request.getCaptchaToken(),
                httpRequest.getRemoteAddr()
        );

        if (!captchaOk) {
            return ResponseEntity.badRequest().build();
        }

        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        User user = securityUtil.getCurrentUser();
        UserDTO userDTO = UserMapper.userToUserDTO(user);
        return ResponseEntity.ok(userDTO);
    }
}
