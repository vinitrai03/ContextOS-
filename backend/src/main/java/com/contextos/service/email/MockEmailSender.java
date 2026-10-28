package com.contextos.service.email;

import com.contextos.model.Email;
import com.contextos.model.EmailRecipient;
import com.contextos.model.DeliveryStatus;
import com.contextos.repository.EmailRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
@Profile("dev | test")
@RequiredArgsConstructor
@Slf4j
public class MockEmailSender implements EmailSender {

    private final EmailRepository emailRepository;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    @Override
    public void sendEmail(Email email) {
        log.info("MockEmailSender: Sending email ID {}", email.getId());

        // Simulate async delivery delay
        scheduler.schedule(() -> {
            simulateDelivery(email);
        }, 3, TimeUnit.SECONDS);
    }

    @Transactional
    protected void simulateDelivery(Email email) {
        log.info("MockEmailSender: Simulating delivery for email ID {}", email.getId());
        Email savedEmail = emailRepository.findById(email.getId()).orElse(null);
        if (savedEmail == null) return;

        boolean allDelivered = true;

        for (EmailRecipient recipient : savedEmail.getRecipients()) {
            if ("bounce@example.com".equals(recipient.getEmailAddress())) {
                recipient.setDeliveryStatus(DeliveryStatus.BOUNCED);
                recipient.setFailureReason("Mock bounce simulation");
                allDelivered = false;
            } else if ("fail@example.com".equals(recipient.getEmailAddress())) {
                recipient.setDeliveryStatus(DeliveryStatus.FAILED);
                recipient.setFailureReason("Mock failure simulation");
                allDelivered = false;
            } else {
                recipient.setDeliveryStatus(DeliveryStatus.DELIVERED);
                recipient.setDeliveredAt(OffsetDateTime.now());
            }
        }

        emailRepository.save(savedEmail);
        log.info("MockEmailSender: Finished simulating delivery for email ID {}", email.getId());
    }
}
