package com.application.chat_app.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class EmailService {

    private final RestTemplate restTemplate;
    private final ResourceLoader resourceLoader;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.logo-url}")
    private String logoUrl;

    @Value("${brevo.api-key}")
    private String brevoApiKey;

    public EmailService(RestTemplate restTemplate, ResourceLoader resourceLoader) {
        this.restTemplate = restTemplate;
        this.resourceLoader = resourceLoader;
    }

    public void sendVerificationEmail(String toEmail, String token) {
        String link = frontendUrl + "/verify-email?token=" + token;
        String html = buildEmailTemplate(
                "Verify your email",
                "Welcome to Echo!",
                "Please verify your email address to start using Echo. This link expires in <strong>15 minutes</strong>.",
                link,
                "Verify Email →",
                "If you didn't create an account, you can safely ignore this email."
        );
        sendViaBrevo(toEmail, "Verify your Echo account", html);
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String link = frontendUrl + "/reset-password?token=" + token;
        String html = buildEmailTemplate(
                "Reset your password",
                "Forgot your password?",
                "Click the button below to reset your password. This link expires in <strong>15 minutes</strong>.",
                link,
                "Reset Password →",
                "If you didn't request this, you can safely ignore this email."
        );
        sendViaBrevo(toEmail, "Reset your Echo password", html);
    }

    private void sendViaBrevo(String toEmail, String subject, String html) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", brevoApiKey);

        String senderEmail = "vaidapaul29@gmail.com";

        Map<String, Object> body = Map.of(
                "sender", Map.of("email", senderEmail, "name", "Echo"),
                "to", new Object[]{Map.of("email", toEmail)},
                "subject", subject,
                "htmlContent", html
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        restTemplate.postForObject("https://api.brevo.com/v3/smtp/email", request, String.class);
    }

    private String buildEmailTemplate(String title, String heading, String message,
                                      String buttonLink, String buttonText, String footerNote) {
        try {
            var resource = resourceLoader.getResource("classpath:templates/email-template.html");
            String template = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
            String privacyLink = frontendUrl + "/privacy";
            return template
                    .replace("{{title}}", title)
                    .replace("{{logoUrl}}", logoUrl)
                    .replace("{{heading}}", heading)
                    .replace("{{message}}", message)
                    .replace("{{buttonLink}}", buttonLink)
                    .replace("{{buttonText}}", buttonText)
                    .replace("{{footerNote}}", footerNote)
                    .replace("{{privacyLink}}", privacyLink);
        } catch (Exception e) {
            throw new RuntimeException("Failed to load email template", e);
        }
    }
}
