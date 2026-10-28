package com.contextos.repository.ai;

import com.contextos.model.ai.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findByMeetingIdOrderByPositionAsc(UUID meetingId);
    List<Task> findByAssigneeIdOrderByPositionAsc(UUID assigneeId);
    List<Task> findByStatusOrderByPositionAsc(String status);
    
    @Query("SELECT MAX(t.position) FROM Task t WHERE t.status = :status")
    Double findMaxPositionByStatus(@Param("status") String status);
}
