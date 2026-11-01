package com.campusnotify.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TermWorkRequestDto {
    private UUID studentId;
    private String subjectCode;
    private String academicYear;
    private BigDecimal attendancePct;
    private List<BigDecimal> practicalMarks;
    private BigDecimal vivaMark;
}
