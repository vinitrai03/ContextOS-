package com.contextos.service.email;

import com.contextos.model.*;
import com.contextos.repository.*;
import com.contextos.service.ai.AiClient;
import com.contextos.service.ai.AiEmailResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import com.contextos.repository.ai.MeetingSummaryRepository;
import com.contextos.model.ai.MeetingSummary;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailGenerationService {

    private final AiClient aiClient;
    private final EmailRepository emailRepository;
    private final EmailThreadRepository emailThreadRepository;
    private final EmailSettingsRepository emailSettingsRepository;
    private final EmailService emailService;
    private final MeetingParticipantRepository participantRepository;
    private final MeetingSummaryRepository meetingSummaryRepository;

    @Transactional
    public Email generateAndQueueMeetingEmail(Meeting meeting, EmailType type, Map<String, Object> diffPayload, String extraInstructions) {
        log.info("EmailGenerationService: Generating {} email for meeting {}", type, meeting.getId());

        if (type == EmailType.FOLLOW_UP) {
            MeetingSummary summary = meetingSummaryRepository.findByMeetingIdAndIsCurrentTrue(meeting.getId()).orElse(null);
            if (summary != null) {
                if (extraInstructions == null) extraInstructions = "";
                extraInstructions += "\nHere is the meeting summary: " + summary.getOverview();
            }
        }

        AiEmailResponse aiResponse = aiClient.generateEmail(type, meeting.getId(), "FORMAL", extraInstructions, diffPayload);

        EmailSettings settings = emailSettingsRepository.findByUserId(meeting.getHost().getId()).orElseGet(() -> {
            EmailSettings defaultSettings = new EmailSettings();
            defaultSettings.setSendMode(SendMode.AUTO);
            defaultSettings.setFromName(meeting.getHost().getName());
            return defaultSettings;
        });

        EmailThread thread = new EmailThread();
        thread.setSubject(aiResponse.subject());
        thread = emailThreadRepository.save(thread);

        Email email = new Email();
        email.setThread(thread);
        email.setSender(meeting.getHost());
        email.setSenderEmail(meeting.getHost().getEmail());
        email.setSubject(aiResponse.subject());
        email.setBodyHtml(aiResponse.bodyHtml());
        email.setBodyText(aiResponse.bodyText());
        email.setType(type);
        email.setAiGenerated(true);
        email.setMeeting(meeting);
        email.setMessageId(UUID.randomUUID().toString() + "@contextos.local");

        if (settings.getSendMode() == SendMode.AUTO) {
            email.setStatus(EmailStatus.QUEUED);
        } else {
            email.setStatus(EmailStatus.PENDING_APPROVAL);
        }

        List<MeetingParticipant> participants = participantRepository.findByMeetingId(meeting.getId());
        List<EmailRecipient> recipients = participants.stream()
                .filter(p -> !p.getEmail().equals(meeting.getHost().getEmail())) // Don't send to host as TO by default, unless desired. Let's send to all participants.
                .map(p -> {
                    EmailRecipient r = new EmailRecipient();
                    r.setEmail(email);
                    r.setUser(p.getUser());
                    r.setEmailAddress(p.getEmail());
                    r.setKind(RecipientKind.TO);
                    r.setDeliveryStatus(DeliveryStatus.PENDING);
                    return r;
                }).collect(Collectors.toList());

        email.setRecipients(recipients);
        emailRepository.save(email);

        if (settings.getSendMode() == SendMode.AUTO) {
            emailService.dispatchEmail(email);
        }

        return email;
    }
}
