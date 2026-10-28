package com.contextos.controller;

import com.contextos.exception.ResourceNotFoundException;
import com.contextos.model.Notification;
import com.contextos.model.User;
import com.contextos.repository.NotificationRepository;
import com.contextos.repository.UserRepository;
import com.contextos.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
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
    public ResponseEntity<List<Notification>> getMyNotifications() {
        User user = getCurrentUser();
        return ResponseEntity.ok(notificationRepository.findByUserOrderByCreatedAtDesc(user));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        User user = getCurrentUser();
        long unread = notificationRepository.countByUserAndIsReadFalse(user);
        return ResponseEntity.ok(Map.of("unreadCount", unread));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable UUID id) {
        User user = getCurrentUser();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));

        if (!notification.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        notification.setRead(true);
        notification.setReadAt(ZonedDateTime.now());
        return ResponseEntity.ok(notificationRepository.save(notification));
    }

    @PostMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        User user = getCurrentUser();
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        for (Notification n : notifications) {
            if (!n.isRead()) {
                n.setRead(true);
                n.setReadAt(ZonedDateTime.now());
                notificationRepository.save(n);
            }
        }
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
