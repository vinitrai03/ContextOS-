package com.contextos.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "transcript_segments")
@Data
@NoArgsConstructor
public class TranscriptSegment {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private MeetingSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "speaker_id")
    private User speaker;

    @Column(name = "speaker_name", nullable = false)
    private String speakerName;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "start_offset_ms", nullable = false)
    private Long startOffsetMs;

    @Column(name = "end_offset_ms", nullable = false)
    private Long endOffsetMs;

    @Column(name = "confidence")
    private Double confidence;

    @Column(name = "language", length = 50)
    private String language = "en-US";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
