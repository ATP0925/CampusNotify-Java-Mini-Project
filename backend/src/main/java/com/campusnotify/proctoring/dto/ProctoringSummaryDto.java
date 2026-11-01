package com.campusnotify.proctoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProctoringSummaryDto {
    private UUID submissionId;
    private int totalViolations;
    private int focusLostCount;
    private long totalFocusLostDurationMs;
    private int burstInjectionCount;
    private double integrityScore; // 0.0 to 100.0
    private double penaltyDeduction; // marks deducted or penalty points
    private boolean flagForReview;
}
