package com.contextos.repository.ai;

import com.contextos.model.ai.MeetingSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.Optional;

public interface MeetingSummaryRepository extends JpaRepository<MeetingSummary, UUID> {
    Optional<MeetingSummary> findByMeetingIdAndIsCurrentTrue(UUID meetingId);
}
