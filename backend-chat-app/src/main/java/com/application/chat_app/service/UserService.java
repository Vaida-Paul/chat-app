package com.application.chat_app.service;

import com.application.chat_app.dto.UserDTO;
import com.application.chat_app.mapper.UserMapper;
import com.application.chat_app.model.User;
import com.application.chat_app.repository.UserRepository;
import com.application.chat_app.util.SecurityUtil;
import org.springdoc.core.service.SecurityService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collector;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final SecurityUtil securityUtil;
    private final CloudinaryService cloudinaryService;

    public UserService(UserRepository userRepository, SecurityUtil securityUtil, CloudinaryService cloudinaryService) {
        this.userRepository = userRepository;
        this.securityUtil = securityUtil;
        this.cloudinaryService = cloudinaryService;
    }

    @Transactional
    public UserDTO updateUsername(String username) {
        User currentUser = securityUtil.getCurrentUser();
        currentUser.setUsername(username);
        userRepository.save(currentUser);
        return UserMapper.userToUserDTO(currentUser);
    }
    @Transactional
    public UserDTO uploadAvatar(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        long size = file.getSize();
        String originalName = file.getOriginalFilename();

        System.out.println("[AVATAR] contentType=" + contentType
                + " size=" + size
                + " name=" + originalName);

        if (contentType == null || !contentType.startsWith("image/")) {
            System.out.println("[AVATAR] REJECTED — bad content type: " + contentType);
            throw new IllegalArgumentException("File must be an image");
        }
        if (size > 10 * 1024 * 1024) {
            System.out.println("[AVATAR] REJECTED — too large: " + size);
            throw new IllegalArgumentException("File size must be under 10MB");
        }

        User currentUser = securityUtil.getCurrentUser();
        String url = cloudinaryService.uploadAvatar(file, currentUser.getId());
        currentUser.setAvatarUrl(url);
        userRepository.save(currentUser);
        return UserMapper.userToUserDTO(currentUser);
    }
    @Transactional
    public UserDTO removeAvatar() throws IOException {
        User currentUser = securityUtil.getCurrentUser();
        if (currentUser.getAvatarUrl() != null) {
            cloudinaryService.deleteAvatar(currentUser.getId());
            currentUser.setAvatarUrl(null);
            userRepository.save(currentUser);
        }
        return UserMapper.userToUserDTO(currentUser);
    }

    public UserDTO getMe() {
        return UserMapper.userToUserDTO(securityUtil.getCurrentUser());
    }

    public List<UserDTO> searchUsers(String query) {
        User currentUser = securityUtil.getCurrentUser();
        List<User> users = userRepository.findByEmailContainingOrCodeContaining(query);

        return users.stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .map(user -> UserMapper.userToUserDTO(user))
                .collect(Collectors.toList());
    }
}
