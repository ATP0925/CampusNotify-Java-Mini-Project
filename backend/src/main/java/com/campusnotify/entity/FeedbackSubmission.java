package com.campusnotify.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "feedback_submissions")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackSubmission extends BaseEntity {

    @Column(name = "faculty_id", nullable = false)
    private UUID facultyId;

    @Column(name = "subject_code", nullable = false, length = 50)
    private String subjectCode;

    @Column(name = "blinded_token_hash", nullable = false, length = 128)
    private String blindedTokenHash;

    @Column(name = "rating_clarity", nullable = false)
    private int ratingClarity; // 1-5

    @Column(name = "rating_punctuality", nullable = false)
    private int ratingPunctuality; // 1-5

    @Column(name = "rating_knowledge", nullable = false)
    private int ratingKnowledge; // 1-5

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    @Builder.Default
    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt = Instant.now();
}
