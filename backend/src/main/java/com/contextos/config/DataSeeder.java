package com.contextos.config;

import com.contextos.model.*;
import com.contextos.repository.AuditLogRepository;
import com.contextos.repository.MeetingParticipantRepository;
import com.contextos.repository.MeetingRepository;
import com.contextos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.UUID;

@Slf4j
@Component
@Profile({"dev", "demo"})
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository participantRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            log.info("Database already seeded.");
            return;
        }

        log.info("Seeding Database...");

        // Users
        User admin = User.builder()
                .name("Admin User")
                .email("admin@contextos.local")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .build();
        userRepository.save(admin);

        User p1 = User.builder()
                .name("Alice Smith")
                .email("alice@example.com")
                .passwordHash(passwordEncoder.encode("password"))
                .role(Role.PARTICIPANT)
                .build();
        userRepository.save(p1);

        // Meetings
        Meeting m1 = Meeting.builder()
                .meetingCode("CTX-XYZ123AB")
                .title("Q3 Strategy Review")
                .description("Reviewing our Q3 goals and roadmap")
                .startTime(ZonedDateTime.now().plusHours(2))
                .endTime(ZonedDateTime.now().plusHours(3))
                .durationMinutes(60)
                .host(admin)
                .meetingLink("http://localhost:5173/meet/CTX-XYZ123AB")
                .status(MeetingStatus.SCHEDULED)
                .build();
        meetingRepository.save(m1);

        participantRepository.save(MeetingParticipant.builder()
                .meeting(m1)
                .user(admin)
                .email(admin.getEmail())
                .role(MeetingParticipantRole.HOST)
                .accessStatus(AccessStatus.ACCEPTED)
                .build());

        participantRepository.save(MeetingParticipant.builder()
                .meeting(m1)
                .user(p1)
                .email(p1.getEmail())
                .role(MeetingParticipantRole.PARTICIPANT)
                .accessStatus(AccessStatus.INVITED)
                .build());

        Meeting m2 = Meeting.builder()
                .meetingCode("CTX-ABC987XY")
                .title("Daily Standup")
                .description("Team sync")
                .startTime(ZonedDateTime.now().minusHours(24))
                .endTime(ZonedDateTime.now().minusHours(23))
                .durationMinutes(60)
                .host(admin)
                .meetingLink("http://localhost:5173/meet/CTX-ABC987XY")
                .status(MeetingStatus.COMPLETED)
                .build();
        meetingRepository.save(m2);
        
        participantRepository.save(MeetingParticipant.builder()
                .meeting(m2)
                .user(admin)
                .email(admin.getEmail())
                .role(MeetingParticipantRole.HOST)
                .accessStatus(AccessStatus.ACCEPTED)
                .build());

        // Audit Logs
        auditLogRepository.save(AuditLog.builder()
                .actor(admin)
                .action("SYSTEM_INIT")
                .entityType("SYSTEM")
                .build());

        log.info("Database Seeding Completed.");
    }
}
