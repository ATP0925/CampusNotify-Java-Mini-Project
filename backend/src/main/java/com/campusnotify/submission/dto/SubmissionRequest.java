package com.campusnotify.submission.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionRequest {
    private UUID practicalId;
    private UUID studentId;
    private String content; // source code
    private String language; // "java", "python", "cpp", "sql", "javascript"
    private String executionStatus; // "SUCCESS", "FAILED"
    private Integer exitCode;
}
