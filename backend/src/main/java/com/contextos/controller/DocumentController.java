package com.contextos.controller;

import com.contextos.exception.ResourceNotFoundException;
import com.contextos.model.Meeting;
import com.contextos.model.ai.MeetingSummary;
import com.contextos.repository.MeetingRepository;
import com.contextos.repository.ai.MeetingSummaryRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final MeetingRepository meetingRepository;
    private final MeetingSummaryRepository summaryRepository;

    @Data
    @Builder
    public static class DocumentDto {
        private UUID id;
        private UUID meetingId;
        private String title;
        private String type; // MEETING_SUMMARY | TRANSCRIPT | CONTEXT_BRIEF
        private String overview;
        private ZonedDateTime createdAt;
        private String author;
    }

    @GetMapping
    public ResponseEntity<List<DocumentDto>> getDocuments() {
        List<Meeting> meetings = meetingRepository.findAll();
        List<DocumentDto> documents = new ArrayList<>();

        for (Meeting m : meetings) {
            Optional<MeetingSummary> summaryOpt = summaryRepository.findByMeetingIdAndIsCurrentTrue(m.getId());
            if (summaryOpt.isPresent()) {
                MeetingSummary summary = summaryOpt.get();
                documents.add(DocumentDto.builder()
                        .id(summary.getId())
                        .meetingId(m.getId())
                        .title(m.getTitle() + " - Executive Summary")
                        .type("MEETING_SUMMARY")
                        .overview(summary.getOverview())
                        .createdAt(m.getCreatedAt())
                        .author(m.getHost() != null ? m.getHost().getName() : "AI Pipeline")
                        .build());
            } else {
                documents.add(DocumentDto.builder()
                        .id(m.getId())
                        .meetingId(m.getId())
                        .title(m.getTitle() + " - Meeting Notes")
                        .type("CONTEXT_BRIEF")
                        .overview(m.getDescription() != null ? m.getDescription() : "Meeting schedule context.")
                        .createdAt(m.getCreatedAt())
                        .author(m.getHost() != null ? m.getHost().getName() : "System")
                        .build());
            }
        }

        return ResponseEntity.ok(documents);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDocument(@PathVariable UUID id) {
        Optional<MeetingSummary> summaryOpt = summaryRepository.findById(id);
        if (summaryOpt.isPresent()) {
            return ResponseEntity.ok(summaryOpt.get());
        }

        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));

        return ResponseEntity.ok(Map.of(
                "id", meeting.getId(),
                "title", meeting.getTitle(),
                "description", meeting.getDescription(),
                "meetingCode", meeting.getMeetingCode(),
                "createdAt", meeting.getCreatedAt()
        ));
    }
}
