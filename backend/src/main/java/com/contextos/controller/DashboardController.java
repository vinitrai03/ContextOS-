package com.contextos.controller;

import com.contextos.dto.DashboardSummaryResponse;
import com.contextos.model.AuditLog;
import com.contextos.model.Meeting;
import com.contextos.model.User;
import com.contextos.repository.AuditLogRepository;
import com.contextos.repository.MeetingRepository;
import com.contextos.repository.UserRepository;
import com.contextos.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final MeetingRepository meetingRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow();
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary() {
        User user = getCurrentUser();
        ZonedDateTime now = ZonedDateTime.now();
        ZonedDateTime startOfDay = now.truncatedTo(ChronoUnit.DAYS);
        ZonedDateTime endOfDay = startOfDay.plusDays(1);

        long upcoming = meetingRepository.countUpcomingByHost(user, now);
        long today = meetingRepository.countTodayByHost(user, startOfDay, endOfDay);
        long completed = meetingRepository.countCompletedByHost(user);

        List<AuditLog> recentActivity = auditLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 10)).getContent();
        List<Meeting> todayAgenda = meetingRepository.findTodayAgenda(user, startOfDay, endOfDay);

        DashboardSummaryResponse response = DashboardSummaryResponse.builder()
                .upcomingMeetings(upcoming)
                .todayMeetings(today)
                .completedMeetings(completed)
                .cancelledMeetings(0) // Simplification for now
                .pendingTasks(0)
                .pendingCommitments(0)
                .recentDecisions(0)
                .recentActivity(recentActivity)
                .todayAgenda(todayAgenda)
                .build();

        return ResponseEntity.ok(response);
    }
}
