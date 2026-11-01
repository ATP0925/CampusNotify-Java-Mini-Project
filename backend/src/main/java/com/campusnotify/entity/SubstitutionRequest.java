package com.campusnotify.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "substitution_requests")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubstitutionRequest extends BaseEntity {

    @Column(name = "timetable_slot_id", nullable = false)
    private UUID timetableSlotId;

    @Column(name = "requesting_faculty_id", nullable = false)
    private UUID requestingFacultyId;

    @Column(name = "substitute_faculty_id", nullable = false)
    private UUID substituteFacultyId;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Builder.Default
    @Column(name = "status", nullable = false, length = 50)
    private String status = "REQUESTED"; // REQUESTED, ACCEPTED, REJECTED, APPROVED_BY_HOD

    @Builder.Default
    @Column(name = "hod_approved", nullable = false)
    private boolean hodApproved = false;

    @Builder.Default
    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt = Instant.now();

    @Column(name = "resolved_at")
    private Instant resolvedAt;
}
