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
public class RevalReconciliationResultDto {
    private String studentRollNo;
    private String subjectCode;
    private String outcome; // "CLEARED_PASSED", "UNCHANGED_FAILED", "REVAL_FAILED"
    private boolean ktTicketRevoked;
    private BigDecimal feeRefundCredit;
    private boolean transcriptUpdated;
    private String transcriptIntegritySha256;
    private String auditMessage;
}
