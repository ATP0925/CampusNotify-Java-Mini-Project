package com.campusnotify.academic.controller;

import com.campusnotify.academic.dto.DefaulterEvaluationDto;
import com.campusnotify.academic.service.DefaulterPipelineService;
import com.campusnotify.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/academic/defaulters")
@RequiredArgsConstructor
public class AcademicDefaulterController {

    private final DefaulterPipelineService defaulterPipelineService;

    @GetMapping("/evaluate")
    public ResponseEntity<ApiResponse<DefaulterEvaluationDto>> evaluate(
            @RequestParam BigDecimal attendance,
            @RequestParam int dayCheckpoint,
            @RequestParam(required = false, defaultValue = "0") BigDecimal medicalLeave) {
        DefaulterEvaluationDto result = defaulterPipelineService.evaluateDefaulter(attendance, dayCheckpoint, medicalLeave);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/lock-hall-ticket")
    public ResponseEntity<ApiResponse<String>> lockHallTicket(@RequestBody Map<String, Object> payload) {
        UUID studentId = UUID.fromString((String) payload.get("studentId"));
        String reason = (String) payload.getOrDefault("reason", "DEFAULTER_TIER_D3_ATTENDANCE_DEFICIT");
        defaulterPipelineService.lockHallTicketForD3(studentId, reason);
        return ResponseEntity.ok(ApiResponse.success("Hall ticket successfully locked for student " + studentId));
    }
}
