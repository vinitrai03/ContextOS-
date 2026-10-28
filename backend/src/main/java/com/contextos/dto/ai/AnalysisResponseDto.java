package com.contextos.dto.ai;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class AnalysisResponseDto {
    private SummaryDto summary;
    private List<DecisionDto> decisions;
    private List<CommitmentDto> commitments;
    private List<TaskDto> tasks;

    @Data
    public static class SummaryDto {
        private String overview;
        private List<String> keyPoints;
        private List<String> unresolvedQuestions;
        private List<String> deadlines;
    }

    @Data
    public static class DecisionDto {
        private String title;
        private String reason;
        private List<ParticipantDto> participants;
        private List<UUID> sourceSegmentIds;
        private BigDecimal confidence;
    }

    @Data
    public static class ParticipantDto {
        private String name;
        private String role; // PROPOSER|SUPPORTER|OBJECTOR|DECIDER
    }

    @Data
    public static class CommitmentDto {
        private String speakerName;
        private String description;
        private String deadlineRaw;
        private List<UUID> sourceSegmentIds;
        private String evidenceQuote;
        private BigDecimal confidence;
    }

    @Data
    public static class TaskDto {
        private String title;
        private String description;
        private String assigneeNameRaw;
        private String priority; // LOW|MEDIUM|HIGH|URGENT
        private String deadlineRaw;
        private List<UUID> sourceSegmentIds;
        private String evidenceQuote;
        private BigDecimal confidence;
    }
}
