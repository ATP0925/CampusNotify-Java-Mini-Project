package com.campusnotify.academic.service;

import com.campusnotify.academic.dto.ReceiptQrRequestDto;
import com.campusnotify.academic.dto.ReceiptQrResultDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

/**
 * Feature 39: Cryptographic Fee Receipt QR Seal & Verification Engine.
 * Generates and validates tamper-proof HMAC-SHA256 digital seals on student fee receipts
 * to eliminate forged PDF submissions at the Exam Cell / Library desk.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FinanceService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    // Internal signing secret for college institutional receipts
    private static final byte[] RECEIPT_HMAC_SECRET = "PVPPCOE_FINANCE_DIGITAL_SEAL_SECRET_KEY_2026_ENTERPRISE".getBytes(StandardCharsets.UTF_8);

    public ReceiptQrResultDto generateReceiptQr(ReceiptQrRequestDto request) {
        log.info("Generating cryptographic receipt QR for roll: {}, receipt: {}",
                request.getStudentRollNo(), request.getReceiptNumber());

        String rawData = String.format("%s|%s|%s|%s|%s|%s",
                request.getReceiptNumber(),
                request.getStudentRollNo(),
                request.getAmount().toPlainString(),
                request.getFeeHead(),
                request.getUtrNumber(),
                request.getPaymentGateway());

        String signature = computeHmacSha256(rawData);
        String payload = Base64.getUrlEncoder().encodeToString((rawData + "|" + signature).getBytes(StandardCharsets.UTF_8));

        return ReceiptQrResultDto.builder()
                .receiptNumber(request.getReceiptNumber())
                .studentRollNo(request.getStudentRollNo())
                .amount(request.getAmount())
                .feeHead(request.getFeeHead())
                .utrNumber(request.getUtrNumber())
                .hmacSignature(signature)
                .qrEncryptedPayload(payload)
                .valid(true)
                .timestamp(Instant.now())
                .build();
    }

    public boolean verifyReceiptPayload(String qrPayload) {
        if (qrPayload == null || qrPayload.isBlank()) {
            return false;
        }

        try {
            byte[] decoded = Base64.getUrlDecoder().decode(qrPayload);
            String fullString = new String(decoded, StandardCharsets.UTF_8);
            int lastPipe = fullString.lastIndexOf('|');
            if (lastPipe == -1) {
                return false;
            }

            String data = fullString.substring(0, lastPipe);
            String expectedSig = fullString.substring(lastPipe + 1);
            String actualSig = computeHmacSha256(data);

            return actualSig.equals(expectedSig);
        } catch (Exception e) {
            log.warn("Receipt verification failed due to invalid formatting: {}", e.getMessage());
            return false;
        }
    }

    public BigDecimal calculateLateFeeFine(long daysOverdue) {
        if (daysOverdue <= 7) {
            return BigDecimal.ZERO; // 7-day grace period
        }
        long chargeableDays = daysOverdue - 7;
        // ₹100 flat per day overdue after grace period
        return BigDecimal.valueOf(chargeableDays * 100L);
    }

    private String computeHmacSha256(String data) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(RECEIPT_HMAC_SECRET, HMAC_ALGORITHM));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("HMAC-SHA256 signature generation error", e);
        }
    }
}
