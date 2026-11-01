package com.campusnotify.proctoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProctoringViolationDto {
    private UUID id;
    private UUID submissionId;
    private UUID studentId;
    private String violationType;
    private int characterDelta;
    private long timeDeltaMs;
    private Double velocityCharsPerSec;
    private String metadataJson;
    private Instant timestamp;
}
