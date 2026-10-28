package com.contextos.service;

import com.contextos.dto.MeetingRequest;
import com.contextos.exception.ResourceNotFoundException;
import com.contextos.model.*;
import com.contextos.repository.AuditLogRepository;
import com.contextos.repository.MeetingParticipantRepository;
import com.contextos.repository.MeetingRepository;
import com.contextos.repository.NotificationRepository;
import com.contextos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationRepository notificationRepository;
    private final com.contextos.service.email.EmailGenerationService emailGenerationService;

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    @Transactional
    public Meeting createMeeting(MeetingRequest request, User host) {
        String code = generateUniqueMeetingCode();
        String link = baseUrl + "/meet/" + code;

        Meeting meeting = Meeting.builder()
                .meetingCode(code)
                .title(request.getTitle())
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getStartTime().plusMinutes(request.getDurationMinutes()))
                .durationMinutes(request.getDurationMinutes())
                .timezone(request.getTimezone() != null ? request.getTimezone() : "UTC")
                .status(MeetingStatus.SCHEDULED)
                .host(host)
                .meetingLink(link)
                .allowScreenShare(true)
                .allowChat(true)
                .recurrenceRule(request.getRecurrenceRule())
                .build();

        meeting = meetingRepository.save(meeting);

        // Add Host as Participant
        MeetingParticipant hostParticipant = MeetingParticipant.builder()
                .meeting(meeting)
                .user(host)
                .email(host.getEmail())
                .role(MeetingParticipantRole.HOST)
                .accessStatus(AccessStatus.ACCEPTED)
                .canScreenShare(true)
                .canChat(true)
                .build();
        participantRepository.save(hostParticipant);

        // Add Invited Participants
        if (request.getParticipantEmails() != null) {
            for (String email : request.getParticipantEmails()) {
                Optional<User> optionalUser = userRepository.findByEmail(email);
                MeetingParticipant p = MeetingParticipant.builder()
                        .meeting(meeting)
                        .user(optionalUser.orElse(null))
                        .email(email)
                        .role(MeetingParticipantRole.PARTICIPANT)
                        .accessStatus(AccessStatus.INVITED)
                        .build();
                participantRepository.save(p);

                // Notify if registered user
                optionalUser.ifPresent(u -> {
                    notificationRepository.save(Notification.builder()
                            .user(u)
                            .type(NotificationType.MEETING_INVITE)
                            .title("New Meeting Invitation")
                            .body("You have been invited to " + request.getTitle())
                            .link(link)
                            .build());
                });
            }
        }

        auditLogRepository.save(AuditLog.builder()
                .actor(host)
                .action("CREATE_MEETING")
                .entityType("MEETING")
                .entityId(meeting.getId())
                .build());

        emailGenerationService.generateAndQueueMeetingEmail(meeting, EmailType.INVITATION, null, null);

        return meeting;
    }

    private String generateUniqueMeetingCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder(8);
            for (int i = 0; i < 8; i++) {
                sb.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
            }
            code = "CTX-" + sb.toString();
        } while (meetingRepository.findByMeetingCode(code).isPresent());
        return code;
    }

    @Transactional(readOnly = true)
    public Page<Meeting> getMyMeetings(User user, Pageable pageable) {
        return meetingRepository.findMeetingsForUser(user, pageable);
    }

    @Transactional(readOnly = true)
    public Meeting getMeetingById(UUID id, User user) {
        Meeting meeting = meetingRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Meeting not found"));
        // Basic auth check: is host or participant
        if (!meeting.getHost().getId().equals(user.getId())) {
            participantRepository.findByMeetingIdAndEmail(meeting.getId(), user.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Not authorized to view this meeting"));
        }
        return meeting;
    }

    @Transactional(readOnly = true)
    public Meeting getMeetingByCode(String code, User user) {
        Meeting meeting = meetingRepository.findByMeetingCode(code).orElseThrow(() -> new ResourceNotFoundException("Meeting not found"));
        if (!meeting.getHost().getId().equals(user.getId())) {
            participantRepository.findByMeetingIdAndEmail(meeting.getId(), user.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Not authorized to view this meeting"));
        }
        return meeting;
    }

    @Transactional
    public Meeting cancelMeeting(UUID id, User host, String reason) {
        Meeting meeting = meetingRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Meeting not found"));
        if (!meeting.getHost().getId().equals(host.getId())) {
            throw new IllegalArgumentException("Only host can cancel the meeting");
        }
        meeting.setStatus(MeetingStatus.CANCELLED);
        meetingRepository.save(meeting);

        auditLogRepository.save(AuditLog.builder()
                .actor(host)
                .action("CANCEL_MEETING")
                .entityType("MEETING")
                .entityId(meeting.getId())
                .metadata(String.format("{\"reason\": \"%s\"}", reason))
                .build());

        emailGenerationService.generateAndQueueMeetingEmail(meeting, EmailType.CANCELLATION, null, reason);

        return meeting;
    }
}
