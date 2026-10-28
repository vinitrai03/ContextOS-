package com.contextos.controller;

import com.contextos.exception.ResourceNotFoundException;
import com.contextos.model.*;
import com.contextos.repository.*;
import com.contextos.security.UserDetailsImpl;
import com.contextos.service.email.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
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
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            throw new ResourceNotFoundException("Authenticated user not found");
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userDetails.getId()));
    }

    @GetMapping
    public ResponseEntity<Page<MailboxItem>> getEmails(
            @RequestParam(required = false, defaultValue = "INBOX") FolderType folder,
            Pageable pageable) {
        User user = getCurrentUser();
        Page<MailboxItem> items = mailboxItemRepository.findByUserIdAndFolderOrderByCreatedAtDesc(user.getId(), folder, pageable);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/approvals")
    public ResponseEntity<List<Email>> getPendingApprovals() {
        return ResponseEntity.ok(emailRepository.findByStatus(EmailStatus.PENDING_APPROVAL));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveEmail(@PathVariable UUID id) {
        Email email = emailRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Email not found"));
        email.setStatus(EmailStatus.QUEUED);
        emailRepository.save(email);
        emailService.dispatchEmail(email);
        return ResponseEntity.ok(Map.of("message", "Email approved and dispatched", "id", id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectEmail(@PathVariable UUID id) {
        Email email = emailRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Email not found"));
        email.setStatus(EmailStatus.DRAFT);
        emailRepository.save(email);
        return ResponseEntity.ok(Map.of("message", "Email rejected and reverted to draft", "id", id));
    }

    @PostMapping
    public ResponseEntity<Email> sendEmail(@RequestBody Email requestEmail) {
        User user = getCurrentUser();
        requestEmail.setSender(user);
        requestEmail.setSenderEmail(user.getEmail());
        emailRepository.save(requestEmail);
        
        emailService.dispatchEmail(requestEmail);
        return ResponseEntity.ok(requestEmail);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<MailboxItem> updateMailboxItem(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> updates) {
        User user = getCurrentUser();
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
