package com.campusnotify.repository;

import com.campusnotify.entity.BlindFeedbackToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BlindFeedbackTokenRepository extends JpaRepository<BlindFeedbackToken, UUID> {
    Optional<BlindFeedbackToken> findByBlindedTokenHash(String blindedTokenHash);
}
