package com.contextos.model.ai;

import com.contextos.model.Meeting;
import com.contextos.model.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.List;

@Entity
@Table(name = "meeting_summaries")
@Data
@NoArgsConstructor
public class MeetingSummary {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analysis_id", nullable = false)
    private MeetingAnalysis analysis;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @Column(columnDefinition = "TEXT")
    private String overview;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "key_points")
    private List<String> keyPoints;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "unresolved_questions")
    private List<String> unresolvedQuestions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "deadlines")
    private List<String> deadlines;

    @Column(name = "is_current")
    private boolean isCurrent = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "edited_by")
    private User editedBy;

    @Column(name = "edited_at")
    private OffsetDateTime editedAt;
}
