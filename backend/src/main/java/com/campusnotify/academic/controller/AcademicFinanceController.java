package com.campusnotify.academic.controller;

import com.campusnotify.academic.dto.ReceiptQrRequestDto;
import com.campusnotify.academic.dto.ReceiptQrResultDto;
import com.campusnotify.academic.service.FinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/academic/finance")
@RequiredArgsConstructor
public class AcademicFinanceController {

    private final FinanceService financeService;

    @PostMapping("/generate-receipt-qr")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<ReceiptQrResultDto> generateReceiptQr(@RequestBody ReceiptQrRequestDto request) {
        return ResponseEntity.ok(financeService.generateReceiptQr(request));
    }

    @PostMapping("/verify-receipt")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> verifyReceipt(@RequestBody Map<String, String> body) {
        String payload = body.get("qrPayload");
        boolean valid = financeService.verifyReceiptPayload(payload);
        return ResponseEntity.ok(Map.of("valid", valid, "verifiedBy", "PVPPCOE_FINANCE_AUTHORITY"));
    }

    @GetMapping("/calculate-fine")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> calculateFine(@RequestParam("daysOverdue") long daysOverdue) {
        BigDecimal fine = financeService.calculateLateFeeFine(daysOverdue);
        return ResponseEntity.ok(Map.of("daysOverdue", daysOverdue, "fineAmount", fine));
    }
}
