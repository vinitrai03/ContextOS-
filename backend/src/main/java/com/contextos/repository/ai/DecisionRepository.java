package com.contextos.repository.ai;

import com.contextos.model.ai.Decision;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface DecisionRepository extends JpaRepository<Decision, UUID> {
    List<Decision> findByMeetingId(UUID meetingId);
}
