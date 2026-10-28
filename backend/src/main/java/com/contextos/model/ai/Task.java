package com.contextos.model.ai;

import com.contextos.model.Meeting;
import com.contextos.model.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.List;

@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id")
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analysis_id")
    private MeetingAnalysis analysis;

    @Column(name = "project_id")
    private UUID projectId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @Column(name = "assignee_name_raw")
    private String assigneeNameRaw;

    @Column(nullable = false)
    private String priority; // LOW|MEDIUM|HIGH|URGENT

    @Column(nullable = false)
    private String status; // TODO|IN_PROGRESS|IN_REVIEW|DONE

    private int progress = 0;

    @Column(name = "deadline_date")
    private OffsetDateTime deadlineDate;

    @Column(name = "deadline_raw")
    private String deadlineRaw;

    private double position = 0.0;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "source_segment_ids")
    private List<UUID> sourceSegmentIds;

    @Column(name = "evidence_quote", columnDefinition = "TEXT")
    private String evidenceQuote;

    private BigDecimal confidence;

    @Column(name = "created_by_ai")
    private boolean createdByAi = true;

    private boolean confirmed = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_commitment_id")
    private Commitment linkedCommitment;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
