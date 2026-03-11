package com.application.chat_app.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class TurnstileService {

    private final RestTemplate restTemplate;
    private final String secretKey;
    private final String verifyUrl;

    public TurnstileService(
            RestTemplate restTemplate,
            @Value("${turnstile.secret}") String secretKey,
            @Value("${turnstile.verify-url:https://challenges.cloudflare.com/turnstile/v0/siteverify}") String verifyUrl
    ) {
        this.restTemplate = restTemplate;
        this.secretKey = secretKey;
        this.verifyUrl = verifyUrl;
    }

    public boolean verifyToken(String token, String remoteIp) {
        if (token == null || token.isBlank()) {
            return false;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("secret", secretKey);
        form.add("response", token);
        if (remoteIp != null && !remoteIp.isBlank()) {
            form.add("remoteip", remoteIp);
        }

        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(form, headers);

        ResponseEntity<TurnstileVerifyResponse> response = restTemplate.postForEntity(
                verifyUrl,
                requestEntity,
                TurnstileVerifyResponse.class
        );

        TurnstileVerifyResponse body = response.getBody();
        return response.getStatusCode().is2xxSuccessful() && body != null && body.isSuccess();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class TurnstileVerifyResponse {

        @JsonProperty("success")
        private boolean success;

        @JsonProperty("error-codes")
        private List<String> errorCodes;

        public boolean isSuccess() {
            return success;
        }

        public List<String> getErrorCodes() {
            return errorCodes;
        }
    }
}

