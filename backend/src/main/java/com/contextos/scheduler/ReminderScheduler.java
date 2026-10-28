package com.contextos.scheduler;

import com.contextos.model.EmailType;
import com.contextos.model.Meeting;
import com.contextos.model.MeetingStatus;
import com.contextos.repository.MeetingRepository;
import com.contextos.service.email.EmailGenerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.time.OffsetDateTime;
import java.util.List;

import com.contextos.repository.ai.TaskRepository;
import com.contextos.repository.ai.CommitmentRepository;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReminderScheduler {

    private final MeetingRepository meetingRepository;
    private final EmailGenerationService emailGenerationService;
    private final TaskRepository taskRepository;
    private final CommitmentRepository commitmentRepository;

    // Run every minute
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void scheduleReminders() {
        log.info("Checking for meetings that need reminders...");

        ZonedDateTime now = ZonedDateTime.now();
        ZonedDateTime soon = now.plusMinutes(16); // Buffer to catch upcoming

        List<Meeting> upcomingMeetings = meetingRepository.findByStartTimeBetweenAndStatus(now, soon, MeetingStatus.SCHEDULED);

        for (Meeting meeting : upcomingMeetings) {
            log.info("Generating reminder for meeting ID {}", meeting.getId());
            emailGenerationService.generateAndQueueMeetingEmail(meeting, EmailType.REMINDER, null, "Include a short countdown and join link.");
        }
    }

    // Run hourly for overdue items
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void checkOverdueItems() {
        log.info("Checking for overdue tasks and commitments...");
        OffsetDateTime now = OffsetDateTime.now();

        // Tasks
        List<com.contextos.model.ai.Task> activeTasks = taskRepository.findAll().stream()
                .filter(t -> !t.getStatus().equals("DONE") && !t.getStatus().equals("OVERDUE"))
                .filter(t -> t.getDeadlineDate() != null && t.getDeadlineDate().isBefore(now))
                .toList();

        for (com.contextos.model.ai.Task t : activeTasks) {
            log.info("Marking task {} as OVERDUE", t.getId());
            t.setStatus("OVERDUE"); // Add OVERDUE status or just tag it
            taskRepository.save(t);
        }

        // Commitments
        List<com.contextos.model.ai.Commitment> activeCommitments = commitmentRepository.findAll().stream()
                .filter(c -> c.getStatus().equals("PENDING") || c.getStatus().equals("IN_PROGRESS"))
                .filter(c -> c.getDeadlineDate() != null && c.getDeadlineDate().isBefore(now))
                .toList();

        for (com.contextos.model.ai.Commitment c : activeCommitments) {
            log.info("Marking commitment {} as OVERDUE", c.getId());
            c.setStatus("OVERDUE");
            commitmentRepository.save(c);
        }
    }
}
