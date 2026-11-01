package com.campusnotify.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlagiarismAnalysisResultDto {
    private String submissionId;
    private double highestSimilarityPercent;
    private String highestMatchPeerRollNo;
    private String highestMatchSubmissionId;
    private boolean crossBatchCollusion;
    private boolean promptInjectionDetected;
    private String detectedMaliciousPattern;
    private String astNormalizedFingerprint;
    private List<MatchDetailDto> matchedSegments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchDetailDto {
        private String peerRollNo;
        private double similarityScore;
        private int matchingTokensCount;
    }
}

