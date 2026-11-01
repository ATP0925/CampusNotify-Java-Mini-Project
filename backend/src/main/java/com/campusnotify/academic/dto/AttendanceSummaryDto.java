package com.campusnotify.academic.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSummaryDto {
    private UUID studentId;
    private long attended;
    private long conducted;
    private BigDecimal rawPercentage;
    private BigDecimal effectivePercentage;
    private BigDecimal medicalGraceApplied;

    @JsonProperty("isDefaulter")
    private boolean isDefaulter;

    private String tier; // D1, D2, D3, or null
}
