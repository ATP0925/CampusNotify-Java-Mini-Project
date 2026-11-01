package com.campusnotify.academic.dto;

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
public class ReceiptQrResultDto {
    private String receiptNumber;
    private String studentRollNo;
    private BigDecimal amount;
    private String feeHead;
    private String utrNumber;
    private String hmacSignature;
    private String qrEncryptedPayload;
    private boolean valid;
    private Instant timestamp;
}
