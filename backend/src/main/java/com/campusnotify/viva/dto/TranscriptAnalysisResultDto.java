package com.campusnotify.viva.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranscriptAnalysisResultDto {
    private String transcript;
    private List<String> extractedKeywords;
    private int wordCount;
    private int hesitationCount; // "um", "uh", "like", "actually"
    private double conceptualConfidence; // 0.0 to 1.0
    private String clarityAssessment;
}
