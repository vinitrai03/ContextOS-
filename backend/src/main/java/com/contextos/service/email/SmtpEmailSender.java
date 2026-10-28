package com.contextos.service.email;

import com.contextos.model.Email;
import com.contextos.model.EmailRecipient;
import com.contextos.model.DeliveryStatus;
import com.contextos.repository.EmailRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@Profile("prod")
@RequiredArgsConstructor
@Slf4j
public class SmtpEmailSender implements EmailSender {

    private final JavaMailSender javaMailSender;
    private final EmailRepository emailRepository;

    @Override
    @Transactional
    public void sendEmail(Email email) {
        log.info("SmtpEmailSender: Sending email ID {}", email.getId());
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(email.getSenderEmail());
            helper.setSubject(email.getSubject());
            helper.setText(email.getBodyText(), email.getBodyHtml());

            for (EmailRecipient recipient : email.getRecipients()) {
                switch (recipient.getKind()) {
                    case TO -> helper.addTo(recipient.getEmailAddress());
                    case CC -> helper.addCc(recipient.getEmailAddress());
                    case BCC -> helper.addBcc(recipient.getEmailAddress());
                }
            }

            javaMailSender.send(message);

            // In SMTP without webhooks, we assume sent means delivered until a bounce occurs.
            for (EmailRecipient recipient : email.getRecipients()) {
                recipient.setDeliveryStatus(DeliveryStatus.SENT);
                recipient.setDeliveredAt(OffsetDateTime.now());
            }

        } catch (Exception e) {
            log.error("Failed to send email ID {}", email.getId(), e);
            for (EmailRecipient recipient : email.getRecipients()) {
                recipient.setDeliveryStatus(DeliveryStatus.FAILED);
                recipient.setFailureReason(e.getMessage());
            }
        }
        emailRepository.save(email);
    }
}
