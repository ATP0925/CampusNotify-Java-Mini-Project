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
public class ReceiptQrRequestDto {
    private String receiptNumber;
    private String studentRollNo;
    private BigDecimal amount;
    private String feeHead; // "TUITION_FEE", "DEVELOPMENT_FEE", "EXAM_KT_FEE"
    private String utrNumber;
    private String paymentGateway;
}

