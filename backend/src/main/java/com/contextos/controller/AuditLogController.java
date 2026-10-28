package com.contextos.controller;

import com.contextos.model.AuditLog;
import com.contextos.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    public ResponseEntity<Page<AuditLog>> getAuditLogs(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByCreatedAtDesc(pageable));
    }
}

