package com.application.chat_app.controllers;

import com.application.chat_app.dto.*;
import com.application.chat_app.mapper.UserMapper;
import com.application.chat_app.model.User;
import com.application.chat_app.service.AuthService;
import com.application.chat_app.service.TurnstileService;
import com.application.chat_app.util.SecurityUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request,
                                      HttpServletRequest httpRequest) {
        boolean captchaOk = turnstileService.verifyToken(
                request.getCaptchaToken(), httpRequest.getRemoteAddr());
        if (!captchaOk) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Captcha verification failed"));
        }
        authService.register(request);
        return ResponseEntity.ok(Map.of("message", "Verification email sent"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/verify-email")
    public ResponseEntity<AuthResponse> verifyEmail(@RequestParam String token) {
        AuthResponse response = authService.verifyEmail(token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> body) {
        authService.resendVerification(body.get("email"));
        return ResponseEntity.ok(Map.of("message", "Verification email resent"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "If that email exists, a reset link was sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        User user = securityUtil.getCurrentUser();
        return ResponseEntity.ok(UserMapper.userToUserDTO(user));
    }
}
