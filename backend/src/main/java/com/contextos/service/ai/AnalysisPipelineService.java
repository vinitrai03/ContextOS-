package com.contextos.service.ai;

import com.contextos.dto.ai.AnalysisResponseDto;
import com.contextos.model.Meeting;
import com.contextos.model.User;
import com.contextos.model.ai.*;
import com.contextos.repository.MeetingRepository;
import com.contextos.repository.UserRepository;
import com.contextos.repository.ai.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.UUID;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalysisPipelineService {

    private final MeetingAnalysisRepository analysisRepository;
    private final MeetingSummaryRepository summaryRepository;
    private final DecisionRepository decisionRepository;
    private final CommitmentRepository commitmentRepository;
    private final TaskRepository taskRepository;
    private final MeetingRepository meetingRepository;
    private final UserRepository userRepository;
    private final AiClient aiClient;
    private final SimpMessagingTemplate messagingTemplate;

    @Async
    @Transactional
    public void runAnalysis(UUID meetingId, UUID userId, String triggerType) {
        log.info("Starting AI Analysis pipeline for meeting {} triggered by {}", meetingId, triggerType);

        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new IllegalArgumentException("Meeting not found"));

        MeetingAnalysis analysis = new MeetingAnalysis();
        analysis.setMeeting(meeting);
        analysis.setStatus("RUNNING");
        analysis.setStartedAt(OffsetDateTime.now());
        analysis.setModelName("demo-model-v1");
        analysis.setPromptVersion("v1");
        analysis.setTriggerType(triggerType);

        if (userId != null) {
            User triggerUser = userRepository.findById(userId).orElse(null);
            analysis.setTriggeredBy(triggerUser);
        }

        // Check if there is an existing analysis to set version
        Optional<MeetingAnalysis> lastAnalysis = analysisRepository.findFirstByMeetingIdOrderByVersionDesc(meetingId);
        lastAnalysis.ifPresent(a -> analysis.setVersion(a.getVersion() + 1));

        analysisRepository.save(analysis);

        sendStatusUpdate(meetingId, "READING_TRANSCRIPT");

        try {
            // Mocking a short delay to simulate pipeline stages
            Thread.sleep(1000);
            
            sendStatusUpdate(meetingId, "EXTRACTING_DECISIONS");
            // Simulate extracting string
            String mockTranscript = "Mock transcript content...";
            
            Thread.sleep(1000);
            sendStatusUpdate(meetingId, "DETECTING_COMMITMENTS");
            
            // Invoke the AI Client
            AnalysisResponseDto dto = aiClient.analyzeTranscript(mockTranscript, AnalysisResponseDto.class);

            Thread.sleep(1000);
            sendStatusUpdate(meetingId, "CREATING_TASKS");

            // Invalidate old summary
            summaryRepository.findByMeetingIdAndIsCurrentTrue(meetingId).ifPresent(oldSummary -> {
                oldSummary.setCurrent(false);
                summaryRepository.save(oldSummary);
            });

            // Save Summary
            MeetingSummary summary = new MeetingSummary();
            summary.setAnalysis(analysis);
            summary.setMeeting(meeting);
            summary.setOverview(dto.getSummary().getOverview());
            summary.setKeyPoints(dto.getSummary().getKeyPoints());
            summary.setUnresolvedQuestions(dto.getSummary().getUnresolvedQuestions());
            summary.setDeadlines(dto.getSummary().getDeadlines());
            summary.setCurrent(true);
            summaryRepository.save(summary);

            // Save Decisions
            if (dto.getDecisions() != null) {
                for (var decDto : dto.getDecisions()) {
                    Decision decision = new Decision();
                    decision.setMeeting(meeting);
                    decision.setAnalysis(analysis);
                    decision.setTitle(decDto.getTitle());
                    decision.setReason(decDto.getReason());
                    decision.setStatus("PROPOSED"); // default
                    decision.setConfidence(decDto.getConfidence());
                    // participants resolution would go here (not implemented for demo simplicity, just strings)
                    decisionRepository.save(decision);
                }
            }

            // Save Commitments
            if (dto.getCommitments() != null) {
                for (var comDto : dto.getCommitments()) {
                    Commitment commitment = new Commitment();
                    commitment.setMeeting(meeting);
                    commitment.setAnalysis(analysis);
                    commitment.setPersonNameRaw(comDto.getSpeakerName());
                    commitment.setDescription(comDto.getDescription());
                    commitment.setDeadlineRaw(comDto.getDeadlineRaw());
                    commitment.setDeadlineDate(resolveDate(comDto.getDeadlineRaw(), meeting.getStartTime()));
                    commitment.setStatus("PENDING");
                    commitment.setConfidence(comDto.getConfidence());
                    commitment.setEvidenceQuote(comDto.getEvidenceQuote());
                    
                    // Resolve user
                    userRepository.findByNameIgnoreCase(comDto.getSpeakerName()).ifPresent(commitment::setPerson);

                    commitmentRepository.save(commitment);
                }
            }

            // Save Tasks
            if (dto.getTasks() != null) {
                double position = 0;
                for (var taskDto : dto.getTasks()) {
                    Task task = new Task();
                    task.setMeeting(meeting);
                    task.setAnalysis(analysis);
                    task.setTitle(taskDto.getTitle());
                    task.setDescription(taskDto.getDescription());
                    task.setAssigneeNameRaw(taskDto.getAssigneeNameRaw());
                    task.setPriority(taskDto.getPriority());
                    task.setDeadlineRaw(taskDto.getDeadlineRaw());
                    task.setDeadlineDate(resolveDate(taskDto.getDeadlineRaw(), meeting.getStartTime()));
                    task.setStatus("TODO");
                    task.setConfidence(taskDto.getConfidence());
                    task.setEvidenceQuote(taskDto.getEvidenceQuote());
                    task.setPosition(position++);

                    // Resolve user
                    userRepository.findByNameIgnoreCase(taskDto.getAssigneeNameRaw()).ifPresent(task::setAssignee);

                    taskRepository.save(task);
                }
            }

            Thread.sleep(1000);
            sendStatusUpdate(meetingId, "WRITING_SUMMARY");

            analysis.setStatus("COMPLETED");
            analysis.setCompletedAt(OffsetDateTime.now());
            analysisRepository.save(analysis);

            sendStatusUpdate(meetingId, "COMPLETED");
            log.info("AI Analysis pipeline completed for meeting {}", meetingId);

        } catch (Exception e) {
            log.error("Analysis pipeline failed", e);
            analysis.setStatus("FAILED");
            analysis.setErrorMessage(e.getMessage());
            analysis.setCompletedAt(OffsetDateTime.now());
            analysisRepository.save(analysis);
            sendStatusUpdate(meetingId, "FAILED");
        }
    }

    private void sendStatusUpdate(UUID meetingId, String status) {
        messagingTemplate.convertAndSend("/topic/meetings/" + meetingId + "/analysis", "{\"status\": \"" + status + "\"}");
    }

    // Basic heuristic date resolver
    private OffsetDateTime resolveDate(String raw, java.time.ZonedDateTime meetingDate) {
        if (raw == null) return null;
        String lower = raw.toLowerCase();
        
        ZoneId zone = meetingDate.getZone();
        
        if (lower.contains("friday")) {
            return meetingDate.with(TemporalAdjusters.next(DayOfWeek.FRIDAY)).toOffsetDateTime();
        }
        if (lower.contains("monday")) {
            return meetingDate.with(TemporalAdjusters.next(DayOfWeek.MONDAY)).toOffsetDateTime();
        }
        if (lower.contains("tomorrow")) {
            return meetingDate.plusDays(1).toOffsetDateTime();
        }
        if (lower.contains("next week")) {
            return meetingDate.plusWeeks(1).toOffsetDateTime();
        }
        
        return null;
    }
}
