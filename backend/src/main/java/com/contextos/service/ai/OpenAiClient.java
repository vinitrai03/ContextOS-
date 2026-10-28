package com.contextos.service.ai;

import com.contextos.model.EmailType;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Primary
@ConditionalOnProperty(name = "openai.api-key")
@Slf4j
public class OpenAiClient implements AiClient {

    @Value("${openai.api-key}")
    private String apiKey;

    @Value("${openai.model:gpt-4o-mini}")
    private String model;

    private final DemoAiClient fallbackClient;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OpenAiClient(DemoAiClient fallbackClient) {
        this.fallbackClient = fallbackClient;
    }

    @Override
    public AiEmailResponse generateEmail(EmailType type, UUID meetingId, String tone, String extraInstructions, Map<String, Object> diffPayload) {
        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("your_")) {
            return fallbackClient.generateEmail(type, meetingId, tone, extraInstructions, diffPayload);
        }

        try {
            String prompt = String.format("Generate a professional %s email for a meeting. Tone: %s. Extra notes: %s",
                    type.name(), tone != null ? tone : "FORMAL", extraInstructions != null ? extraInstructions : "None");

            String content = callOpenAiApi(prompt);
            return new AiEmailResponse("Subject: ContextOS Update", "Hello,", "<p>" + content + "</p>", content);
        } catch (Exception e) {
            log.warn("OpenAI API call failed, falling back to simulated engine: {}", e.getMessage());
            return fallbackClient.generateEmail(type, meetingId, tone, extraInstructions, diffPayload);
        }
    }

    @Override
    public String rewriteEmail(String action, String currentContent, String threadContext) {
        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("your_")) {
            return fallbackClient.rewriteEmail(action, currentContent, threadContext);
        }

        try {
            String prompt = String.format("Rewrite the following email text with action: %s.\n\nEmail: %s", action, currentContent);
            return callOpenAiApi(prompt);
        } catch (Exception e) {
            log.warn("OpenAI API call failed, falling back: {}", e.getMessage());
            return fallbackClient.rewriteEmail(action, currentContent, threadContext);
        }
    }

    @Override
    public <T> T analyzeTranscript(String transcript, Class<T> responseType) {
        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("your_")) {
            return fallbackClient.analyzeTranscript(transcript, responseType);
        }

        try {
            String prompt = "Analyze the following meeting transcript. Return a strict JSON response containing overview, decisions, tasks, and commitments:\n\n" + transcript;
            String rawJson = callOpenAiApi(prompt);
            return objectMapper.readValue(rawJson, responseType);
        } catch (Exception e) {
            log.warn("OpenAI transcript analysis failed, falling back: {}", e.getMessage());
            return fallbackClient.analyzeTranscript(transcript, responseType);
        }
    }

    private String callOpenAiApi(String userPrompt) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", "You are the ContextOS Executive AI Assistant."),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "temperature", 0.7
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity("https://api.openai.com/v1/chat/completions", entity, Map.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            List choices = (List) response.getBody().get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map firstChoice = (Map) choices.get(0);
                Map message = (Map) firstChoice.get("message");
                return (String) message.get("content");
            }
        }
        throw new RuntimeException("Empty response from OpenAI API");
    }
}

