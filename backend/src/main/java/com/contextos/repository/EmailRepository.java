package com.contextos.repository;

import com.contextos.model.Email;
import com.contextos.model.EmailStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailRepository extends JpaRepository<Email, UUID> {
    List<Email> findByStatus(EmailStatus status);
    Optional<Email> findByMessageId(String messageId);
}
