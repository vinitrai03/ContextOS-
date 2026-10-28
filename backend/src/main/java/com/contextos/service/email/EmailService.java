package com.contextos.service.email;

import com.contextos.model.*;
import com.contextos.repository.EmailRepository;
import com.contextos.repository.MailboxItemRepository;
import com.contextos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final EmailRepository emailRepository;
    private final MailboxItemRepository mailboxItemRepository;
    private final UserRepository userRepository;
    private final EmailSender emailSender;

    @Async
    @Transactional
    public void dispatchEmail(Email email) {
        log.info("EmailService: Dispatching email ID {}", email.getId());
        
        email.setStatus(EmailStatus.QUEUED);
        emailRepository.save(email);

        // Internal delivery logic
        for (EmailRecipient recipient : email.getRecipients()) {
            Optional<User> targetUser = userRepository.findByEmail(recipient.getEmailAddress());
            if (targetUser.isPresent()) {
                deliverInternally(email, targetUser.get());
            }
        }

        // External Delivery via Sender
        email.setStatus(EmailStatus.SENT);
        email.setSentAt(OffsetDateTime.now());
        emailRepository.save(email);

        emailSender.sendEmail(email);
    }

    private void deliverInternally(Email email, User user) {
        log.info("EmailService: Delivering internally to {}", user.getEmail());
        MailboxItem item = new MailboxItem();
        item.setUser(user);
        item.setEmail(email);
        item.setFolder(FolderType.INBOX);
        mailboxItemRepository.save(item);
    }
}
