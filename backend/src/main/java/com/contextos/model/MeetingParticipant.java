package com.contextos.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "meeting_participants")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class MeetingParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private MeetingParticipantRole role = MeetingParticipantRole.PARTICIPANT;

    @Enumerated(EnumType.STRING)
    @Column(name = "access_status", nullable = false, length = 50)
    @Builder.Default
    private AccessStatus accessStatus = AccessStatus.INVITED;

    @Column(name = "can_screen_share", nullable = false)
    @Builder.Default
    private boolean canScreenShare = false;

    @Column(name = "can_chat", nullable = false)
    @Builder.Default
    private boolean canChat = true;

    @Column(name = "joined_at")
    private ZonedDateTime joinedAt;

    @Column(name = "left_at")
    private ZonedDateTime leftAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
}
