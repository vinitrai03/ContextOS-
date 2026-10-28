package com.contextos.repository;

import com.contextos.model.MailboxItem;
import com.contextos.model.FolderType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MailboxItemRepository extends JpaRepository<MailboxItem, UUID> {
    Page<MailboxItem> findByUserIdAndFolderOrderByCreatedAtDesc(UUID userId, FolderType folder, Pageable pageable);
    Page<MailboxItem> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}
