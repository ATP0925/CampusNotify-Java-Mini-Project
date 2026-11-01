package com.campusnotify.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.Instant;
import java.util.UUID;

/**
 * Examination Hall Ticket unlocked automatically upon 8-node DAG No-Dues clearance.
 */
@Entity
@Table(name = "hall_tickets")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HallTicket extends BaseEntity {

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "semester", nullable = false)
    private int semester;

    @Column(name = "academic_year", nullable = false, length = 20)
    private String academicYear;

    @Builder.Default
    @Column(name = "is_locked", nullable = false)
    private boolean isLocked = true;

    @Column(name = "lock_reason", length = 255)
    private String lockReason;

    @Column(name = "cleared_at")
    private Instant clearedAt;

    @Column(name = "digital_signature", length = 255)
    private String digitalSignature;

    @Builder.Default
    @Column(name = "issued_at", nullable = false)
    private Instant issuedAt = Instant.now();
}
