package com.contextos.controller;

import com.contextos.exception.ResourceNotFoundException;
import com.contextos.model.*;
import com.contextos.repository.MeetingParticipantRepository;
import com.contextos.repository.MeetingRepository;
import com.contextos.service.VideoSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/meetings")
@RequiredArgsConstructor
@Slf4j
public class VideoRoomController {

    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository participantRepository;
    private final VideoSessionService sessionService;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${coturn.secret:contextos_turn_secret}")
    private String turnSecret;
    
    @Value("${coturn.realm:contextos.local}")
    private String turnRealm;

    @Value("${coturn.urls:turn:localhost:3478}")
    private String turnUrls;

    @PostMapping("/code/{code}/join-token")
    public ResponseEntity<?> getJoinToken(@PathVariable String code, @AuthenticationPrincipal User user) {
        log.info("Requesting join token for meeting code {}", code);
        Meeting meeting = meetingRepository.findByMeetingCode(code).orElseThrow(() -> new ResourceNotFoundException("Meeting not found"));

        boolean isHost = meeting.getHost().getId().equals(user.getId());

        if (meeting.getStatus() == MeetingStatus.CANCELLED) {
            return ResponseEntity.status(403).body(Map.of("reason", "CANCELLED"));
        }
        if (meeting.getStatus() == MeetingStatus.COMPLETED) {
            return ResponseEntity.status(403).body(Map.of("reason", "ENDED", "meetingId", meeting.getId()));
        }

        ZonedDateTime now = ZonedDateTime.now();
        // Allow joining 15 minutes before
        if (now.isBefore(meeting.getStartTime().minusMinutes(15)) && !isHost) {
            return ResponseEntity.status(403).body(Map.of("reason", "NOT_STARTED_YET", "startTime", meeting.getStartTime()));
        }

        if (!isHost) {
            Optional<MeetingParticipant> participantOpt = participantRepository.findByMeetingIdAndEmail(meeting.getId(), user.getEmail());
            if (participantOpt.isEmpty()) {
                return ResponseEntity.status(403).body(Map.of("reason", "NO_ACCESS"));
            }
            MeetingParticipant p = participantOpt.get();
            if (p.getAccessStatus() != AccessStatus.ACCEPTED) {
                return ResponseEntity.status(403).body(Map.of("reason", "NO_ACCESS"));
            }
            if (meeting.isLocked()) {
                return ResponseEntity.status(403).body(Map.of("reason", "LOCKED"));
            }
        }

        MeetingSession session = sessionService.getOrCreateSession(meeting.getId(), user);

        // Generate temporary TURN credentials (simplified)
        long timestamp = System.currentTimeMillis() / 1000 + 86400; // 1 day valid
        String turnUsername = timestamp + ":" + user.getId().toString();
        // In real life, use HMAC-SHA1 to sign it with turnSecret. For capstone, we will just pass a mocked or simplified credential since we might not strictly enforce auth in local coturn.
        
        return ResponseEntity.ok(Map.of(
            "token", "mock-token-for-" + user.getId(), // the websocket connection is secured by the normal JWT anyway
            "meetingId", meeting.getId(),
            "sessionId", session.getId(),
            "role", isHost ? "HOST" : "PARTICIPANT",
            "iceServers", java.util.List.of(
                Map.of("urls", "stun:stun.l.google.com:19302"),
                Map.of(
                    "urls", turnUrls,
                    "username", turnUsername,
                    "credential", "mocked_credential" // We would generate an HMAC here
                )
            )
        ));
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<?> endMeeting(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        Meeting meeting = meetingRepository.findById(id).orElseThrow();
        if (!meeting.getHost().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        sessionService.endSession(id, user); // Needs actual sessionId, let's assume we can lookup active session
        messagingTemplate.convertAndSend("/topic/meetings/" + id + "/events", Map.of(
            "type", "MEETING_ENDED"
        ));
        
        return ResponseEntity.ok().build();
    }
}
