package com.application.chat_app.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ResendEmailService {

    private final Resend resend;
    private final String fromEmail;
    private final String frontendUrl;
    private final String logoUrl;

    public ResendEmailService(@Value("${resend.api-key}") String apiKey,
                              @Value("${app.email-from}") String fromEmail,
                              @Value("${app.frontend-url}") String frontendUrl,
                              @Value("${app.logo-url}") String logoUrl) {
        this.resend = new Resend(apiKey);
        this.fromEmail = fromEmail;
        this.frontendUrl = frontendUrl;
        this.logoUrl = logoUrl;
    }

    public void sendVerificationEmail(String toEmail, String token) {
        String link = frontendUrl + "/verify-email?token=" + token;
        String html = buildEmailTemplate(
                "Verify your email",
                "Welcome to Echo",
                "Please verify your email address to start using Echo. This link expires in 15 minutes.",
                link,
                "Verify Email →",
                "If you didn't create an account, you can safely ignore this email."
        );
        sendEmail(toEmail, "Verify your Echo account", html);
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String link = frontendUrl + "/reset-password?token=" + token;
        String html = buildEmailTemplate(
                "Reset your password",
                "Forgot your password?",
                "Click the button below to reset your password. This link expires in 15 minutes.",
                link,
                "Reset Password →",
                "If you didn't request this, you can safely ignore this email."
        );
        sendEmail(toEmail, "Reset your Echo password", html);
    }

    private void sendEmail(String to, String subject, String html) {
        try {
            CreateEmailOptions options = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(to)
                    .subject(subject)
                    .html(html)
                    .build();
            CreateEmailResponse response = resend.emails().send(options);
            System.out.println("Email sent: " + response.getId());
        } catch (ResendException e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }

    private String buildEmailTemplate(String title, String heading, String message,
                                  String buttonLink, String buttonText, String footerNote) {
    String privacyLink = frontendUrl + "/privacy";
    String template = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>{{title}}</title>
        </head>
        <body style="margin:0; padding:0; background-color:#f3f4f6; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
                <tr>
                    <td align="center">
                        <table width="100%" style="max-width:420px; background:#0f172a; border-radius:12px; border:1px solid #1e293b;">
                            <tr>
                                <td style="padding:20px 20px 12px 20px; text-align:center;">
                                    <img src="{{logoUrl}}"
                                         width="52"
                                         height="52"
                                         style="display:block; margin:0 auto 12px auto; border-radius:14px; box-shadow:0 4px 12px rgba(0,0,0,0.25);">
                                    <div style="font-size:15px; font-weight:600; color:#e5e7eb;">Echo</div>
                                </td>
                            </tr>
                            <tr><td style="border-top:1px solid #1e293b;"></td></tr>
                            <tr>
                                <td style="padding:20px; text-align:center;">
                                    <div style="font-size:16px; font-weight:600; color:#f9fafb; margin-bottom:10px;">{{heading}}</div>
                                    <div style="font-size:13px; color:#9ca3af; line-height:1.5; margin-bottom:20px;">{{message}}</div>
                                    <a href="{{buttonLink}}"
                                       style="display:inline-block; padding:10px 18px; font-size:13px; font-weight:600; color:#ffffff; background-color:#6366f1; text-decoration:none; border-radius:6px;">{{buttonText}}</a>
                                    <div style="margin-top:20px; font-size:11px; color:#6b7280;">{{footerNote}}</div>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:14px; text-align:center; border-top:1px solid #1e293b;">
                                    <div style="font-size:11px; color:#6b7280;">
                                        © 2026 Echo ·
                                        <a href="{{privacyLink}}" style="color:#9ca3af; text-decoration:none;">Privacy</a>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    """;
    return template
        .replace("{{title}}", title)
        .replace("{{logoUrl}}", logoUrl)
        .replace("{{heading}}", heading)
        .replace("{{message}}", message)
        .replace("{{buttonLink}}", buttonLink)
        .replace("{{buttonText}}", buttonText)
        .replace("{{footerNote}}", footerNote)
        .replace("{{privacyLink}}", privacyLink);
    }
}
