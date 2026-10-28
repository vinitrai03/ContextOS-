package com.contextos.service;

import com.contextos.model.*;
import com.contextos.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class VideoSessionService {

    private final MeetingSessionRepository sessionRepository;
    private final SessionParticipantRepository sessionParticipantRepository;
    private final MeetingRepository meetingRepository;
    private final StringRedisTemplate redisTemplate;

    private static final String PRESENCE_PREFIX = "meeting:presence:";
    private static final long PRESENCE_TTL_SECONDS = 30;

    @Transactional
    public MeetingSession getOrCreateSession(UUID meetingId, User user) {
        Meeting meeting = meetingRepository.findById(meetingId).orElseThrow();
        
        Optional<MeetingSession> activeSessionOpt = sessionRepository.findFirstByMeetingIdAndStatusOrderByCreatedAtDesc(meetingId, SessionStatus.ACTIVE);
        MeetingSession session;
        
        if (activeSessionOpt.isPresent()) {
            session = activeSessionOpt.get();
        } else {
            session = new MeetingSession();
            session.setMeeting(meeting);
            session.setStartedBy(user);
            session.setStartedAt(OffsetDateTime.now());
            session.setStatus(SessionStatus.ACTIVE);
            session = sessionRepository.save(session);
            
            meeting.setStatus(MeetingStatus.LIVE);
            meetingRepository.save(meeting);
            log.info("Created new ACTIVE session {} for meeting {}", session.getId(), meetingId);
        }

        return session;
    }

    @Transactional
    public void endSession(UUID sessionId, User host) {
        MeetingSession session = sessionRepository.findById(sessionId).orElseThrow();
        // Check host auth in controller
        
        session.setStatus(SessionStatus.ENDED);
        session.setEndedAt(OffsetDateTime.now());
        sessionRepository.save(session);

        Meeting meeting = session.getMeeting();
        meeting.setStatus(MeetingStatus.COMPLETED);
        meetingRepository.save(meeting);

        log.info("Session {} ENDED", sessionId);
    }

    public void updatePresence(UUID meetingId, UUID userId) {
        String key = PRESENCE_PREFIX + meetingId + ":" + userId;
        redisTemplate.opsForValue().set(key, "online", PRESENCE_TTL_SECONDS, TimeUnit.SECONDS);
    }

    public boolean isUserPresent(UUID meetingId, UUID userId) {
        String key = PRESENCE_PREFIX + meetingId + ":" + userId;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    // Cron job to cleanup empty sessions
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cleanupEmptySessions() {
        // Basic cleanup: find active sessions, check redis keys
        // Since we are mocking advanced presence right now, we will leave this as a stub
        // In a real system, we iterate active sessions and query `KEYS meeting:presence:id:*`.
        // If empty for 5 minutes, we call endSession()
    }
}
