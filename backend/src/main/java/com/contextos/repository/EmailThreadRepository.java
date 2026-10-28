package com.contextos.repository;

import com.contextos.model.EmailThread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface EmailThreadRepository extends JpaRepository<EmailThread, UUID> {
}
