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
public class PlagiarismAnalysisRequestDto {
    private String submissionId;
    private String studentRollNo;
    private String programmingLanguage; // "java", "python", "cpp", "javascript"
    private String sourceCode;
    private List<PeerCodeCandidateDto> peerSubmissions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PeerCodeCandidateDto {
        private String submissionId;
        private String peerRollNo;
        private String sourceCode;
    }
}

