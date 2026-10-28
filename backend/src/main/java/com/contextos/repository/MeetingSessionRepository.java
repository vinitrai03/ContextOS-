package com.contextos.repository;

import com.contextos.model.MeetingSession;
import com.contextos.model.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MeetingSessionRepository extends JpaRepository<MeetingSession, UUID> {
    Optional<MeetingSession> findFirstByMeetingIdAndStatusOrderByCreatedAtDesc(UUID meetingId, SessionStatus status);
    List<MeetingSession> findByMeetingId(UUID meetingId);
}
