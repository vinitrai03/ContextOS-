package com.contextos.service.ai;

import com.contextos.model.EmailType;
import com.contextos.model.Meeting;
import com.contextos.repository.MeetingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@Profile("dev | test")
@RequiredArgsConstructor
@Slf4j
public class DemoAiClient implements AiClient {

    private final MeetingRepository meetingRepository;

    @Override
    public AiEmailResponse generateEmail(EmailType type, UUID meetingId, String tone, String extraInstructions, Map<String, Object> diffPayload) {
        log.info("DemoAiClient: Generating email of type {} for meeting {}", type, meetingId);
        
        Meeting meeting = meetingId != null ? meetingRepository.findById(meetingId).orElse(null) : null;
        String title = meeting != null ? meeting.getTitle() : "ContextOS Meeting";
        
        String subject = "Update regarding " + title;
        String greeting = "Hello,";
        String bodyHtml = "<p>This is a simulated AI-generated email for the " + type.name() + " event.</p>";
        String bodyText = "This is a simulated AI-generated email for the " + type.name() + " event.";

        if (type == EmailType.INVITATION && meeting != null) {
            subject = "Invitation: " + title;
            bodyHtml = "<p>You have been invited to a meeting.</p><p><strong>Title:</strong> " + title + "</p><p><strong>Link:</strong> <a href='" + meeting.getMeetingLink() + "'>Join Meeting</a></p>";
            bodyText = "You have been invited to a meeting. Title: " + title + ". Link: " + meeting.getMeetingLink();
        } else if (type == EmailType.CANCELLATION) {
            subject = "Cancelled: " + title;
            bodyHtml = "<p>Please note that the meeting <strong>" + title + "</strong> has been cancelled.</p>";
            bodyText = "Please note that the meeting " + title + " has been cancelled.";
        }

        return new AiEmailResponse(subject, greeting, bodyHtml, bodyText);
    }

    @Override
    public String rewriteEmail(String action, String currentContent, String threadContext) {
        log.info("DemoAiClient: Rewriting email with action {}", action);
        return "<p>[AI Rewritten - " + action + "]</p><p>" + currentContent + "</p>";
    }

    @Override
    public <T> T analyzeTranscript(String transcript, Class<T> responseType) {
        log.info("DemoAiClient: Analyzing transcript ({} chars) into {}", transcript.length(), responseType.getSimpleName());
        
        try {
            // For Demo mode, if it's the AnalysisResponseDto, we mock the results
            if (responseType.getName().endsWith("AnalysisResponseDto")) {
                String jsonResponse = """
                {
                    "summary": {
                        "overview": "Project Architecture Meeting to decide on the core database technology and assign initial development tasks.",
                        "keyPoints": [
                            "Discussed relational vs NoSQL databases",
                            "Evaluated PostgreSQL vector capabilities"
                        ],
                        "unresolvedQuestions": [],
                        "deadlines": ["Friday: Auth API", "Monday: Project docs"]
                    },
                    "decisions": [
                        {
                            "title": "Use PostgreSQL instead of MongoDB",
                            "reason": "relational transaction requirements",
                            "participants": [
                                { "name": "Abhed", "role": "PROPOSER" },
                                { "name": "Rahul", "role": "SUPPORTER" }
                            ],
                            "sourceSegmentIds": [],
                            "confidence": 0.95
                        }
                    ],
                    "commitments": [
                        {
                            "speakerName": "Rahul",
                            "description": "complete the authentication API",
                            "deadlineRaw": "by Friday",
                            "sourceSegmentIds": [],
                            "evidenceQuote": "I will complete the authentication API by Friday",
                            "confidence": 0.92
                        }
                    ],
                    "tasks": [
                        {
                            "title": "Prepare project documentation",
                            "description": "Write the initial architecture and setup documentation",
                            "assigneeNameRaw": "Priya",
                            "priority": "HIGH",
                            "deadlineRaw": "due Monday",
                            "sourceSegmentIds": [],
                            "evidenceQuote": "Priya will prepare the project documentation due Monday",
                            "confidence": 0.88
                        }
                    ]
                }
                """;
                return new com.fasterxml.jackson.databind.ObjectMapper().readValue(jsonResponse, responseType);
            }
            return responseType.getDeclaredConstructor().newInstance();
        } catch (Exception e) {
            log.error("Failed to mock analyzeTranscript", e);
            throw new RuntimeException("Demo extraction failed", e);
        }
    }
}
