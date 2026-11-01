package com.campusnotify.submission.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
public class BatchRosterItemDto {
    private String id;
    private String submissionId;
    private String studentId;
    private String studentName;
    private String rollNo;
    private String status;
    private BigDecimal marks;
    private BigDecimal aiScore;
    private Instant submittedAt;
    private boolean isLate;

    @JsonProperty("isVirtualMissing")
    private boolean isVirtualMissing;

    @JsonProperty("isVirtual")
    public boolean isVirtual() {
        return isVirtualMissing;
    }

    private int violationsCount;
    private String feedback;
}
