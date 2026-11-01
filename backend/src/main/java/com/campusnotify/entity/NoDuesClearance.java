package com.campusnotify.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "no_dues_clearances")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoDuesClearance extends BaseEntity {

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "node_code", nullable = false, length = 50)
    private String nodeCode;

    @Builder.Default
    @Column(name = "status", nullable = false, length = 50)
    private String status = "PENDING"; // PENDING, CLEARED, REJECTED

    @Builder.Default
    @Column(name = "pending_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal pendingAmount = BigDecimal.ZERO;

    @Column(name = "cleared_by")
    private UUID clearedBy;

    @Column(name = "cleared_at")
    private Instant clearedAt;

    @Column(name = "transaction_ref", length = 100)
    private String transactionRef;

    @Column(name = "digital_signature", length = 255)
    private String digitalSignature;
}
