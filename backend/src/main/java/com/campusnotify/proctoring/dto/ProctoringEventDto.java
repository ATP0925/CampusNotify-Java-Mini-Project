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
public class ProctoringEventDto {
    private UUID submissionId;
    private UUID studentId;
    private String violationType; // BURST_INJECTION_DETECTED, FOCUS_LOST, CLIPBOARD_PASTE_ANOMALY, etc.
    private int characterDelta;
    private long timeDeltaMs;
    private Double velocityCharsPerSec;
    private String metadataJson;
}
