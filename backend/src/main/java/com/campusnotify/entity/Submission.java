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
@Table(name = "submissions")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission extends BaseEntity {

    @Column(name = "practical_id")
    private UUID practicalId;

    @Column(name = "assignment_id")
    private UUID assignmentId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "submission_hash", length = 64)
    private String submissionHash;

    @Builder.Default
    @Column(name = "status", nullable = false, length = 50)
    private String status = "SUBMITTED"; // NOT_SUBMITTED, SUBMITTED, EVALUATED, REDO_REQUESTED

    @Column(name = "marks", precision = 5, scale = 2)
    private BigDecimal marks;

    @Builder.Default
    @Column(name = "max_marks", precision = 5, scale = 2)
    private BigDecimal maxMarks = BigDecimal.valueOf(10.00);

    @Column(name = "ai_score", precision = 5, scale = 2)
    private BigDecimal aiScore;

    @Column(name = "ai_viva_transcript", columnDefinition = "TEXT")
    private String aiVivaTranscript;

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "grader_id")
    private UUID graderId;

    @Builder.Default
    @Column(name = "is_late", nullable = false)
    private boolean isLate = false;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "evaluated_at")
    private Instant evaluatedAt;
}
