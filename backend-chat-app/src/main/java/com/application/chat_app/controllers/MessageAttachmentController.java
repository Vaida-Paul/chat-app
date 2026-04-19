package com.application.chat_app.controllers;

import com.application.chat_app.util.SecurityUtil;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/messages/attachments")
public class MessageAttachmentController {

    private final Cloudinary cloudinary;
    private final SecurityUtil securityUtil;

    public MessageAttachmentController(Cloudinary cloudinary, SecurityUtil securityUtil) {
        this.cloudinary = cloudinary;
        this.securityUtil = securityUtil;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadAttachment(@RequestParam("file") MultipartFile file) throws IOException {

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("File too large");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only images allowed for now");
        }

        Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "chat_attachments",
                        "public_id", "msg_" + System.currentTimeMillis()
                ));
        String url = (String) result.get("secure_url");
        return ResponseEntity.ok(Map.of("url", url, "type", "image"));
    }
}
