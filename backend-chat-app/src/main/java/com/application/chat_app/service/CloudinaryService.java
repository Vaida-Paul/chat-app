package com.application.chat_app.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadAvatar(MultipartFile file, Long userId) throws IOException {
        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "public_id", "avatars/user_" + userId,
                        "overwrite", true,
                        "resource_type", "image",
                        "transformation", "w_200,h_200,c_fill,g_face,q_auto,f_auto"
                )
        );
        return (String) result.get("secure_url");
    }
    public void deleteAvatar(Long userId) throws IOException {
        cloudinary.uploader().destroy(
                "avatars/user" +  userId,
                ObjectUtils.asMap()
        );
    }
}
