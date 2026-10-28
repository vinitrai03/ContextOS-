package com.contextos.repository.ai;

import com.contextos.model.ai.Commitment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface CommitmentRepository extends JpaRepository<Commitment, UUID> {
    List<Commitment> findByMeetingId(UUID meetingId);
    List<Commitment> findByPersonId(UUID personId);
    List<Commitment> findByStatus(String status);
    long countByStatus(String status);
}
