package com.application.chat_app.mapper;

import com.application.chat_app.dto.UserDTO;
import com.application.chat_app.model.User;

public class UserMapper {

    public static UserDTO userToUserDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getCode()
        );
    }
}
