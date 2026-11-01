package com.campusnotify.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.Instant;
import java.util.UUID;

/**
 * Monaco Typing Dynamics & Proctoring Violation Telemetry.
 * Detects DevTools console code injections, burst pasting, and tab switches.
 */
@Entity
@Table(name = "proctoring_violations")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProctoringViolation extends BaseEntity {

    @Column(name = "submission_id")
    private UUID submissionId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "violation_type", nullable = false, length = 100)
    private String violationType; // BURST_INJECTION_DETECTED, FOCUS_LOST, CLIPBOARD_PASTE_ANOMALY, KEYSTROKE_VELOCITY_EXCEEDED

    @Column(name = "character_delta")
    private int characterDelta;

    @Column(name = "time_delta_ms")
    private long timeDeltaMs;

    @Column(name = "velocity_chars_per_sec")
    private Double velocityCharsPerSec;

    @Column(name = "metadata_json", columnDefinition = "TEXT")
    private String metadataJson;

    @Builder.Default
    @Column(name = "timestamp", nullable = false)
    private Instant timestamp = Instant.now();
}
