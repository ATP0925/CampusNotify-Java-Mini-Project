package com.campusnotify.submission.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionDto {
    private UUID id;
    private UUID practicalId;
    private UUID studentId;
    private String content;
    private String submissionHash;
    private String status; // SUBMITTED, EVALUATED, REDO_REQUESTED, UNSUBMITTED, GRADED
    private BigDecimal marks;
    private BigDecimal maxMarks;
    private BigDecimal aiScore;
    private String aiVivaTranscript;
    private String feedback;
    private boolean isLate;
    private int revision;
    private String language;
    private String executionStatus;
    private Integer exitCode;
    private Instant submittedAt;
    private Instant evaluatedAt;
    private UUID graderId;
}
