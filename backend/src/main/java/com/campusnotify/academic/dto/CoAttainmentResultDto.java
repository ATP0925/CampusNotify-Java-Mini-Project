package com.campusnotify.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoAttainmentResultDto {
    private int attainmentLevel;
    private BigDecimal percentageMeetingThreshold;
    private int totalStudents;
    private int meetingCount;
}
