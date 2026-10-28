package com.contextos.controller;

import com.contextos.model.*;
import com.contextos.repository.*;
import com.contextos.service.email.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/emails")
@RequiredArgsConstructor
public class EmailController {

    private final MailboxItemRepository mailboxItemRepository;
    private final EmailRepository emailRepository;
    private final EmailRecipientRepository emailRecipientRepository;
    private final EmailSettingsRepository emailSettingsRepository;
    private final EmailService emailService;

    @GetMapping
    public ResponseEntity<Page<MailboxItem>> getEmails(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false, defaultValue = "INBOX") FolderType folder,
            Pageable pageable) {
        Page<MailboxItem> items = mailboxItemRepository.findByUserIdAndFolderOrderByCreatedAtDesc(user.getId(), folder, pageable);
        return ResponseEntity.ok(items);
    }

    @PostMapping
    public ResponseEntity<Email> sendEmail(@AuthenticationPrincipal User user, @RequestBody Email requestEmail) {
        // Simple draft to send implementation
        requestEmail.setSender(user);
        requestEmail.setSenderEmail(user.getEmail());
        emailRepository.save(requestEmail);
        
        emailService.dispatchEmail(requestEmail);
        return ResponseEntity.ok(requestEmail);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<MailboxItem> updateMailboxItem(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @RequestBody Map<String, Object> updates) {
        MailboxItem item = mailboxItemRepository.findById(id).orElseThrow();
        if (!item.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        if (updates.containsKey("isRead")) {
            item.setRead((Boolean) updates.get("isRead"));
        }
        if (updates.containsKey("isStarred")) {
            item.setStarred((Boolean) updates.get("isStarred"));
        }
        if (updates.containsKey("folder")) {
            item.setFolder(FolderType.valueOf((String) updates.get("folder")));
        }

        return ResponseEntity.ok(mailboxItemRepository.save(item));
    }

    // Webhook for delivery status updates (provider agnostic)
    @PostMapping("/webhooks/delivery")
    public ResponseEntity<Void> handleDeliveryWebhook(@RequestBody Map<String, Object> payload) {
        // e.g. payload contains { "emailAddress": "...", "status": "BOUNCED", "messageId": "..." }
        String emailAddress = (String) payload.get("emailAddress");
        String statusStr = (String) payload.get("status");
        String messageId = (String) payload.get("messageId");

        if (messageId != null && emailAddress != null && statusStr != null) {
            emailRepository.findByMessageId(messageId).ifPresent(email -> {
                for (EmailRecipient recipient : email.getRecipients()) {
                    if (recipient.getEmailAddress().equals(emailAddress)) {
                        recipient.setDeliveryStatus(DeliveryStatus.valueOf(statusStr.toUpperCase()));
                        if (recipient.getDeliveryStatus() == DeliveryStatus.DELIVERED) {
                            recipient.setDeliveredAt(OffsetDateTime.now());
                        }
                        emailRecipientRepository.save(recipient);
                    }
                }
            });
        }
        return ResponseEntity.ok().build();
    }
}
