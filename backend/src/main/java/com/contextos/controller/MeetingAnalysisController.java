package com.contextos.controller;

import com.contextos.model.User;
import com.contextos.model.ai.MeetingAnalysis;
import com.contextos.model.ai.MeetingSummary;
import com.contextos.repository.UserRepository;
import com.contextos.repository.ai.MeetingAnalysisRepository;
import com.contextos.repository.ai.MeetingSummaryRepository;
import com.contextos.service.ai.AnalysisPipelineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/meetings/{id}")
@RequiredArgsConstructor
public class MeetingAnalysisController {

    private final AnalysisPipelineService pipelineService;
    private final MeetingAnalysisRepository analysisRepository;
    private final MeetingSummaryRepository summaryRepository;
    private final UserRepository userRepository;

    @PostMapping("/analyze")
    public ResponseEntity<?> triggerAnalysis(@PathVariable UUID id, @RequestBody(required = false) Map<String, Boolean> body, Authentication auth) {
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        
        // Check if already running
        analysisRepository.findFirstByMeetingIdOrderByVersionDesc(id).ifPresent(last -> {
            if ("RUNNING".equals(last.getStatus()) && (body == null || !Boolean.TRUE.equals(body.get("force")))) {
                throw new IllegalStateException("Analysis is already running");
            }
        });

        pipelineService.runAnalysis(id, user.getId(), "MANUAL");
        return ResponseEntity.accepted().body(Map.of("message", "Analysis queued"));
    }

    @GetMapping("/analysis")
    public ResponseEntity<MeetingAnalysis> getAnalysisStatus(@PathVariable UUID id) {
        return analysisRepository.findFirstByMeetingIdOrderByVersionDesc(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/analysis/history")
    public ResponseEntity<List<MeetingAnalysis>> getAnalysisHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(analysisRepository.findByMeetingIdOrderByStartedAtDesc(id));
    }

    @GetMapping("/summary")
    public ResponseEntity<MeetingSummary> getSummary(@PathVariable UUID id) {
        return summaryRepository.findByMeetingIdAndIsCurrentTrue(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
