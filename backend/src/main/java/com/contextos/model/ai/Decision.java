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
import java.util.List;

@Entity
@Table(name = "decisions")
@Data
@NoArgsConstructor
public class Decision {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analysis_id", nullable = false)
    private MeetingAnalysis analysis;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "decided_at")
    private OffsetDateTime decidedAt;

    @Column(nullable = false)
    private String status; // PROPOSED|CONFIRMED|REVERSED|SUPERSEDED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "superseded_by_id")
    private Decision supersededBy;

    private BigDecimal confidence;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "source_segment_ids")
    private List<UUID> sourceSegmentIds;

    @Column(name = "evidence_quote", columnDefinition = "TEXT")
    private String evidenceQuote;

    @Column(name = "created_by_ai")
    private boolean createdByAi = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "confirmed_by")
    private User confirmedBy;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "tags")
    private List<String> tags;

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
