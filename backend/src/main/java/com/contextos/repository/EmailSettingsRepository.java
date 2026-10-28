package com.contextos.repository;

import com.contextos.model.EmailSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailSettingsRepository extends JpaRepository<EmailSettings, UUID> {
    Optional<EmailSettings> findByUserId(UUID userId);
}
