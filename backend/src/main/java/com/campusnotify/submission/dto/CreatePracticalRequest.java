package com.campusnotify.submission.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePracticalRequest {
    private String title;
    private String description;
    private String subjectCode;
    private int practicalNo;
    private BigDecimal maxMarks;
    private Instant dueDate;
    private String department;
    private Boolean rollSeedParameterized;
}
