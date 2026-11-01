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
public class PracticalDto {
    private UUID id;
    private String title;
    private String description;
    private String subjectCode;
    private int practicalNo;
    private BigDecimal maxMarks;
    private Instant dueDate;
    private String status; // PUBLISHED
    private boolean rollSeedParameterized;
    private String department;
    private Instant createdAt;
}
