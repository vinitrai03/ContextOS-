package com.contextos.repository.ai;

import com.contextos.model.ai.DecisionParticipant;
import com.contextos.model.ai.DecisionParticipantId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DecisionParticipantRepository extends JpaRepository<DecisionParticipant, DecisionParticipantId> {
}
