package com.contextos.model.ai;

import com.contextos.model.Meeting;
import com.contextos.model.MeetingSession;
import com.contextos.model.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "meeting_analyses")
@Data
@NoArgsConstructor
public class MeetingAnalysis {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private MeetingSession session;

    @Column(nullable = false)
    private int version = 1;

    @Column(nullable = false)
    private String status; // QUEUED|RUNNING|COMPLETED|FAILED

    @Column(name = "model_name")
    private String modelName;

    @Column(name = "prompt_version")
    private String promptVersion;

    @Column(name = "started_at")
    private OffsetDateTime startedAt;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "transcript_hash")
    private String transcriptHash;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "triggered_by")
    private User triggeredBy;

    @Column(name = "trigger_type")
    private String triggerType; // AUTO|MANUAL
}
