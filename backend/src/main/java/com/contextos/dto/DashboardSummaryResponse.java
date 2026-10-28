package com.contextos.dto;

import com.contextos.model.AuditLog;
import com.contextos.model.Meeting;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DashboardSummaryResponse {
    private long upcomingMeetings;
    private long todayMeetings;
    private long completedMeetings;
    private long cancelledMeetings;
    private long pendingTasks; // Phase 5
    private long pendingCommitments; // Phase 5
    private long recentDecisions; // Phase 5
    private List<AuditLog> recentActivity;
    private List<Meeting> todayAgenda;
}
