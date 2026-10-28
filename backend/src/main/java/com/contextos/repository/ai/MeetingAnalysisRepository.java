package com.contextos.repository.ai;

import com.contextos.model.ai.MeetingAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.Optional;
import java.util.List;

public interface MeetingAnalysisRepository extends JpaRepository<MeetingAnalysis, UUID> {
    List<MeetingAnalysis> findByMeetingIdOrderByStartedAtDesc(UUID meetingId);
    Optional<MeetingAnalysis> findFirstByMeetingIdOrderByVersionDesc(UUID meetingId);
}
