package com.contextos.repository;

import com.contextos.model.EmailRecipient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface EmailRecipientRepository extends JpaRepository<EmailRecipient, UUID> {
}
