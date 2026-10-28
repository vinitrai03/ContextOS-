package com.contextos.controller;

import com.contextos.model.ai.Commitment;
import com.contextos.repository.ai.CommitmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/commitments")
@RequiredArgsConstructor
public class CommitmentController {

    private final CommitmentRepository commitmentRepository;

    @GetMapping
    public ResponseEntity<List<Commitment>> getCommitments(@RequestParam(required = false) UUID meetingId) {
        if (meetingId != null) {
            return ResponseEntity.ok(commitmentRepository.findByMeetingId(meetingId));
        }
        return ResponseEntity.ok(commitmentRepository.findAll());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Commitment> updateStatus(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        Commitment commitment = commitmentRepository.findById(id).orElseThrow();
        commitment.setStatus(body.get("status"));
        return ResponseEntity.ok(commitmentRepository.save(commitment));
    }
}
