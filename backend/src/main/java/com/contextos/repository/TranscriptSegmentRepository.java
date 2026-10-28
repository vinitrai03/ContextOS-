package com.contextos.repository;

import com.contextos.model.TranscriptSegment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TranscriptSegmentRepository extends JpaRepository<TranscriptSegment, UUID> {
    Page<TranscriptSegment> findByMeetingIdOrderByStartOffsetMsAsc(UUID meetingId, Pageable pageable);
    List<TranscriptSegment> findByMeetingIdOrderByStartOffsetMsAsc(UUID meetingId);
}
