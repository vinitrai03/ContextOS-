package com.contextos.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/meetings/{meetingId}/recording")
@RequiredArgsConstructor
@Slf4j
public class RecordingController {

    @PostMapping("/start")
    public ResponseEntity<?> startRecording(@PathVariable UUID meetingId) {
        log.info("Starting recording for meeting {}", meetingId);
        return ResponseEntity.ok(Map.of("status", "RECORDING_STARTED"));
    }

    @PostMapping("/stop")
    public ResponseEntity<?> stopRecording(@PathVariable UUID meetingId) {
        log.info("Stopping recording for meeting {}", meetingId);
        return ResponseEntity.ok(Map.of("status", "RECORDING_STOPPED"));
    }
}
