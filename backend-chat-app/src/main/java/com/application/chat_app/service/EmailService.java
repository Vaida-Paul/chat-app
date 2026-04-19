package com.application.chat_app.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ResourceLoader;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.nio.charset.StandardCharsets;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final ResourceLoader resourceLoader;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.logo-url}")
    private String logoUrl;

    public EmailService(JavaMailSender mailSender, ResourceLoader resourceLoader) {
        this.mailSender = mailSender;
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
        sendHtmlEmail(toEmail, "Verify your Echo account", html);
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
        sendHtmlEmail(toEmail, "Reset your Echo password", html);
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

    private void sendHtmlEmail(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }
}