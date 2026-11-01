package com.campusnotify.proctoring.controller;

import com.campusnotify.dto.ApiResponse;
import com.campusnotify.proctoring.dto.*;
import com.campusnotify.proctoring.service.ProctoringService;
import com.campusnotify.proctoring.service.TypingDynamicsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/proctoring")
@RequiredArgsConstructor
public class ProctoringController {

    private final TypingDynamicsService typingDynamicsService;
    private final ProctoringService proctoringService;

    @PostMapping("/evaluate-typing")
    public ResponseEntity<ApiResponse<TypingDynamicsEvaluationDto>> evaluateTyping(
            @RequestBody TypingDynamicsRequestDto request) {
        TypingDynamicsEvaluationDto result = typingDynamicsService.evaluateTypingDynamics(
                request.getDeltaChars(), request.getDeltaMs());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/event")
    public ResponseEntity<ApiResponse<ProctoringViolationDto>> logEvent(
            @RequestBody ProctoringEventDto eventDto) {
        ProctoringViolationDto violation = proctoringService.logViolation(eventDto);
        return ResponseEntity.ok(ApiResponse.success(violation));
    }

    @PostMapping("/focus-lost")
    public ResponseEntity<ApiResponse<ProctoringViolationDto>> logFocusLost(
            @RequestBody Map<String, Object> payload) {
        UUID submissionId = payload.get("submissionId") != null ? UUID.fromString(payload.get("submissionId").toString()) : null;
        UUID studentId = payload.get("studentId") != null ? UUID.fromString(payload.get("studentId").toString()) : null;
        long durationMs = payload.get("durationMs") != null ? Long.parseLong(payload.get("durationMs").toString()) : 0L;

        ProctoringViolationDto violation = proctoringService.recordFocusLost(submissionId, studentId, durationMs);
        return ResponseEntity.ok(ApiResponse.success(violation));
    }

    @GetMapping("/submission/{submissionId}")
    public ResponseEntity<ApiResponse<List<ProctoringViolationDto>>> getViolations(
            @PathVariable UUID submissionId) {
        List<ProctoringViolationDto> violations = proctoringService.getViolationsBySubmission(submissionId);
        return ResponseEntity.ok(ApiResponse.success(violations));
    }

    @GetMapping("/summary/{submissionId}")
    public ResponseEntity<ApiResponse<ProctoringSummaryDto>> getSummary(
            @PathVariable UUID submissionId) {
        ProctoringSummaryDto summary = proctoringService.getProctoringSummary(submissionId);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
