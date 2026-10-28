package com.contextos.repository;

import com.contextos.model.SessionParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SessionParticipantRepository extends JpaRepository<SessionParticipant, UUID> {
    List<SessionParticipant> findBySessionId(UUID sessionId);
    Optional<SessionParticipant> findBySessionIdAndUserId(UUID sessionId, UUID userId);
}
