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
public class RevalReconciliationRequestDto {
    private String studentRollNo;
    private String subjectCode;
    private int originalMarks;
    private int revisedMarks;
    private int passingThreshold; // e.g. 32 for 80M paper
    private BigDecimal ktExamFeePaid; // e.g. 1050.00
    private String ktHallTicketId;
}
