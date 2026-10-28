package com.contextos.service.ai;

import com.contextos.model.EmailType;
import java.util.UUID;
import java.util.Map;

public interface AiClient {
    AiEmailResponse generateEmail(EmailType type, UUID meetingId, String tone, String extraInstructions, Map<String, Object> diffPayload);
    String rewriteEmail(String action, String currentContent, String threadContext);
    
    // Phase 5 Structured Extraction
    <T> T analyzeTranscript(String transcript, Class<T> responseType);
}
