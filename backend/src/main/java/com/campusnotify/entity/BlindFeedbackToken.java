package com.campusnotify.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.Instant;

/**
 * Chaumian Blind Signature Token for Anonymous Student Feedback.
 * Ensures zero correlation between student ID and faculty evaluation.
 */
@Entity
@Table(name = "blind_feedback_tokens")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlindFeedbackToken extends BaseEntity {

    @Column(name = "blinded_token_hash", unique = true, nullable = false, length = 128)
    private String blindedTokenHash;

    @Column(name = "signature", columnDefinition = "TEXT")
    private String signature;

    @Builder.Default
    @Column(name = "is_spent", nullable = false)
    private boolean isSpent = false;

    @Column(name = "semester", nullable = false)
    private int semester;

    @Column(name = "academic_year", nullable = false, length = 20)
    private String academicYear;

    @Builder.Default
    @Column(name = "issued_at", nullable = false)
    private Instant issuedAt = Instant.now();

    @Column(name = "spent_at")
    private Instant spentAt;
}
