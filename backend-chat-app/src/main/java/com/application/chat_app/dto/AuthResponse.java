package com.application.chat_app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {

    private String token;

    private String email;

    private String username;

    private String code;

    private String avatarUrl;

    private Long id;
}
