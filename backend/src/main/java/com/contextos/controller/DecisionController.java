package com.contextos.controller;

import com.contextos.model.ai.Decision;
import com.contextos.repository.ai.DecisionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/decisions")
@RequiredArgsConstructor
public class DecisionController {

    private final DecisionRepository decisionRepository;

    @GetMapping
    public ResponseEntity<List<Decision>> getDecisions(@RequestParam(required = false) UUID meetingId) {
        if (meetingId != null) {
            return ResponseEntity.ok(decisionRepository.findByMeetingId(meetingId));
        }
        return ResponseEntity.ok(decisionRepository.findAll());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Decision> updateStatus(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        Decision decision = decisionRepository.findById(id).orElseThrow();
        decision.setStatus(body.get("status"));
        return ResponseEntity.ok(decisionRepository.save(decision));
    }
}
