package com.contextos.controller;

import com.contextos.model.EmailType;
import com.contextos.service.ai.AiClient;
import com.contextos.service.ai.AiEmailResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiClient aiClient;

    @PostMapping("/emails/generate")
    public ResponseEntity<AiEmailResponse> generateEmail(@RequestBody Map<String, Object> request) {
        String typeStr = (String) request.get("type");
        EmailType type = EmailType.valueOf(typeStr != null ? typeStr : "MANUAL");
        String meetingIdStr = (String) request.get("meetingId");
        UUID meetingId = meetingIdStr != null ? UUID.fromString(meetingIdStr) : null;
        String tone = (String) request.get("tone");
        String extraInstructions = (String) request.get("extraInstructions");
        @SuppressWarnings("unchecked")
        Map<String, Object> diffPayload = (Map<String, Object>) request.get("diffPayload");

        AiEmailResponse response = aiClient.generateEmail(type, meetingId, tone, extraInstructions, diffPayload);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/emails/rewrite")
    public ResponseEntity<Map<String, String>> rewriteEmail(@RequestBody Map<String, String> request) {
        String action = request.get("action");
        String currentContent = request.get("currentContent");
        String threadContext = request.get("threadContext");

        String rewritten = aiClient.rewriteEmail(action, currentContent, threadContext);
        return ResponseEntity.ok(Map.of("rewrittenContent", rewritten));
    }
}
