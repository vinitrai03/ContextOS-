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
@Table(name = "commitments")
@Data
@NoArgsConstructor
public class Commitment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analysis_id", nullable = false)
    private MeetingAnalysis analysis;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id")
    private User person;

    @Column(name = "person_name_raw")
    private String personNameRaw;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "deadline_date")
    private OffsetDateTime deadlineDate;

    @Column(name = "deadline_raw")
    private String deadlineRaw;

    @Column(nullable = false)
    private String status; // PENDING|IN_PROGRESS|FULFILLED|OVERDUE|CANCELLED

    private BigDecimal confidence;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "source_segment_ids")
    private List<UUID> sourceSegmentIds;

    @Column(name = "evidence_quote", columnDefinition = "TEXT")
    private String evidenceQuote;

    @Column(name = "fulfilled_at")
    private OffsetDateTime fulfilledAt;

    @Column(name = "created_by_ai")
    private boolean createdByAi = true;

    private boolean confirmed = false;

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
