package com.contextos.controller;

import com.contextos.dto.MeetingRequest;
import com.contextos.model.Meeting;
import com.contextos.model.User;
import com.contextos.repository.UserRepository;
import com.contextos.security.UserDetailsImpl;
import com.contextos.service.MeetingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Meeting> createMeeting(@Valid @RequestBody MeetingRequest request) {
        User host = getCurrentUser();
        Meeting meeting = meetingService.createMeeting(request, host);
        return ResponseEntity.ok(meeting);
    }

    @GetMapping
    public ResponseEntity<Page<Meeting>> getMyMeetings(Pageable pageable) {
        User user = getCurrentUser();
        Page<Meeting> meetings = meetingService.getMyMeetings(user, pageable);
        return ResponseEntity.ok(meetings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Meeting> getMeetingById(@PathVariable UUID id) {
        User user = getCurrentUser();
        Meeting meeting = meetingService.getMeetingById(id, user);
        return ResponseEntity.ok(meeting);
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<Meeting> getMeetingByCode(@PathVariable String code) {
        User user = getCurrentUser();
        Meeting meeting = meetingService.getMeetingByCode(code, user);
        return ResponseEntity.ok(meeting);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> cancelMeeting(@PathVariable UUID id, @RequestBody Map<String, String> request) {
        User host = getCurrentUser();
        String reason = request.getOrDefault("reason", "No reason provided");
        Meeting meeting = meetingService.cancelMeeting(id, host, reason);
        return ResponseEntity.ok(meeting);
    }
}
