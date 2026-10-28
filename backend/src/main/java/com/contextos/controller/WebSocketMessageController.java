package com.contextos.controller;

import com.contextos.model.ChatMessage;
import com.contextos.model.ChatMessageType;
import com.contextos.model.MeetingSession;
import com.contextos.model.TranscriptSegment;
import com.contextos.model.User;
import com.contextos.repository.ChatMessageRepository;
import com.contextos.repository.MeetingSessionRepository;
import com.contextos.repository.TranscriptSegmentRepository;
import com.contextos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketMessageController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;
    private final TranscriptSegmentRepository transcriptSegmentRepository;
    private final MeetingSessionRepository sessionRepository;
    private final UserRepository userRepository;

    @MessageMapping("/meetings/{meetingId}/chat")
    @Transactional
    public void handleChatMessage(@DestinationVariable UUID meetingId, @Payload Map<String, String> payload, SimpMessageHeaderAccessor headerAccessor) {
        Authentication auth = (Authentication) headerAccessor.getUser();
        if (auth == null) return;
        
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        
        String content = payload.get("content");
        String sessionIdStr = payload.get("sessionId");
        if (content == null || sessionIdStr == null) return;
        
        MeetingSession session = sessionRepository.findById(UUID.fromString(sessionIdStr)).orElseThrow();

        ChatMessage msg = new ChatMessage();
        msg.setSession(session);
        msg.setMeeting(session.getMeeting());
        msg.setSender(user);
        msg.setSenderName(user.getName());
        msg.setContent(content);
        msg.setType(ChatMessageType.TEXT);
        msg.setCreatedAt(OffsetDateTime.now());

        chatMessageRepository.save(msg);

        // Broadcast to the room
        messagingTemplate.convertAndSend("/topic/meetings/" + meetingId + "/chat", msg);
    }

    @MessageMapping("/meetings/{meetingId}/transcript")
    @Transactional
    public void handleTranscriptSegment(@DestinationVariable UUID meetingId, @Payload Map<String, Object> payload, SimpMessageHeaderAccessor headerAccessor) {
        Authentication auth = (Authentication) headerAccessor.getUser();
        if (auth == null) return;
        
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

        String sessionIdStr = (String) payload.get("sessionId");
        String content = (String) payload.get("content");
        Number startOffset = (Number) payload.get("startOffsetMs");
        Number endOffset = (Number) payload.get("endOffsetMs");
        
        if (sessionIdStr == null || content == null || startOffset == null || endOffset == null) return;

        MeetingSession session = sessionRepository.findById(UUID.fromString(sessionIdStr)).orElseThrow();

        TranscriptSegment segment = new TranscriptSegment();
        segment.setMeeting(session.getMeeting());
        segment.setSession(session);
        segment.setSpeaker(user);
        segment.setSpeakerName(user.getName());
        segment.setContent(content);
        segment.setStartOffsetMs(startOffset.longValue());
        segment.setEndOffsetMs(endOffset.longValue());
        segment.setLanguage("en-US");

        transcriptSegmentRepository.save(segment);

        messagingTemplate.convertAndSend("/topic/meetings/" + meetingId + "/transcript", segment);
    }

    @MessageMapping("/meetings/{meetingId}/signal")
    public void handleSignaling(@DestinationVariable UUID meetingId, @Payload Map<String, Object> payload, SimpMessageHeaderAccessor headerAccessor) {
        Authentication auth = (Authentication) headerAccessor.getUser();
        if (auth == null) return;
        
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        
        String targetUserId = (String) payload.get("targetUserId");
        if (targetUserId == null) return;

        // Relay signaling message to the specific target user
        payload.put("fromUserId", user.getId().toString());
        messagingTemplate.convertAndSendToUser(targetUserId, "/queue/signal", payload);
    }
}
