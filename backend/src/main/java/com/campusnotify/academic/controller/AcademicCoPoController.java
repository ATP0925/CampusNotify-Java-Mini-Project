package com.campusnotify.academic.controller;

import com.campusnotify.academic.dto.CoAttainmentResultDto;
import com.campusnotify.academic.dto.StudentQuestionScoreDto;
import com.campusnotify.academic.service.CoPoAttainmentService;
import com.campusnotify.dto.ApiResponse;
import com.campusnotify.entity.CoPoMatrix;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/academic/copo")
@RequiredArgsConstructor
public class AcademicCoPoController {

    private final CoPoAttainmentService coPoAttainmentService;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoAttainmentRequest {
        private List<StudentQuestionScoreDto> scores;
        private BigDecimal thresholdPct;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PoAttainmentRequest {
        private Map<String, Integer> coAttainmentLevels;
        private String subjectCode;
    }

    @PostMapping("/co-attainment")
    public ResponseEntity<ApiResponse<CoAttainmentResultDto>> calculateCoAttainment(
            @RequestBody CoAttainmentRequest request) {
        CoAttainmentResultDto result = coPoAttainmentService.calculateCoAttainment(
                request.getScores(), request.getThresholdPct()
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/po-attainment")
    public ResponseEntity<ApiResponse<Map<String, BigDecimal>>> calculatePoAttainment(
            @RequestBody PoAttainmentRequest request) {
        List<CoPoMatrix> mappingMatrix = coPoAttainmentService.getMatrixForSubject(request.getSubjectCode());
        Map<String, BigDecimal> poScores = coPoAttainmentService.calculatePoAttainment(
                request.getCoAttainmentLevels(), mappingMatrix
        );
        return ResponseEntity.ok(ApiResponse.success(poScores));
    }

    @GetMapping("/matrix")
    public ResponseEntity<ApiResponse<List<CoPoMatrix>>> getMatrix(@RequestParam String subjectCode) {
        List<CoPoMatrix> matrix = coPoAttainmentService.getMatrixForSubject(subjectCode);
        return ResponseEntity.ok(ApiResponse.success(matrix));
    }
}
