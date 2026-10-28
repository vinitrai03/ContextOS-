package com.contextos.controller;

import com.contextos.model.ChatMessage;
import com.contextos.model.TranscriptSegment;
import com.contextos.repository.ChatMessageRepository;
import com.contextos.repository.TranscriptSegmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/meetings/{meetingId}")
@RequiredArgsConstructor
@Slf4j
public class ChatAndTranscriptController {

    private final ChatMessageRepository chatMessageRepository;
    private final TranscriptSegmentRepository transcriptSegmentRepository;

    @GetMapping("/chat")
    public ResponseEntity<Page<ChatMessage>> getChatHistory(@PathVariable UUID meetingId, Pageable pageable) {
        Page<ChatMessage> messages = chatMessageRepository.findByMeetingIdOrderByCreatedAtDesc(meetingId, pageable);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/transcript")
    public ResponseEntity<Page<TranscriptSegment>> getTranscript(
            @PathVariable UUID meetingId,
            @RequestParam(required = false) UUID speaker,
            @RequestParam(required = false) String q,
            Pageable pageable) {
        // Simple implementation without complex filters
        Page<TranscriptSegment> segments = transcriptSegmentRepository.findByMeetingIdOrderByStartOffsetMsAsc(meetingId, pageable);
        return ResponseEntity.ok(segments);
    }

    @PostMapping("/transcript/segments")
    public ResponseEntity<TranscriptSegment> addSegment(
            @PathVariable UUID meetingId,
            @RequestBody TranscriptSegment segment) {
        // Fallback for clients without STOMP
        segment = transcriptSegmentRepository.save(segment);
        return ResponseEntity.ok(segment);
    }

    @GetMapping("/transcript/export")
    public ResponseEntity<String> exportTranscript(@PathVariable UUID meetingId, @RequestParam(defaultValue = "txt") String format) {
        // Mock export
        return ResponseEntity.ok("Transcript export for " + meetingId + " in " + format);
    }
}
