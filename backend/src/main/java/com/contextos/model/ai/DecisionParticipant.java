package com.contextos.model.ai;

import com.contextos.model.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "decision_participants")
@Data
@NoArgsConstructor
public class DecisionParticipant {

    @EmbeddedId
    private DecisionParticipantId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("decisionId")
    @JoinColumn(name = "decision_id")
    private Decision decision;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String role; // PROPOSER|SUPPORTER|OBJECTOR|DECIDER
}
