package com.application.chat_app.service;

import com.application.chat_app.dto.UserDTO;
import com.application.chat_app.mapper.UserMapper;
import com.application.chat_app.model.User;
import com.application.chat_app.repository.UserRepository;
import com.application.chat_app.util.SecurityUtil;
import org.springdoc.core.service.SecurityService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collector;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final SecurityUtil securityUtil;

    public UserService(UserRepository userRepository, SecurityUtil securityUtil) {
        this.userRepository = userRepository;
        this.securityUtil = securityUtil;

    }

    public List<UserDTO> searchUsers(String query)
    {
        User currentUser = securityUtil.getCurrentUser();
        List<User> users = userRepository.findByEmailContainingOrCodeContaining(query);

        return users.stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .map( user -> UserMapper.userToUserDTO(user))
                .collect(Collectors.toList());
    }
}
