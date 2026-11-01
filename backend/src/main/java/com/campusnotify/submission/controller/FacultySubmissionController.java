package com.campusnotify.submission.controller;

import com.campusnotify.dto.ApiResponse;
import com.campusnotify.submission.dto.*;
import com.campusnotify.submission.service.FacultySubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/faculty/submissions")
@RequiredArgsConstructor
public class FacultySubmissionController {

    private final FacultySubmissionService facultySubmissionService;

    @GetMapping("/practical/{practicalId}")
    public ResponseEntity<ApiResponse<BatchRosterResponseDto>> getBatchRoster(
            @PathVariable UUID practicalId,
            @RequestParam(required = false, defaultValue = "ALL") String filterTab) {
        BatchRosterResponseDto roster = facultySubmissionService.getRosterForPractical(practicalId, filterTab);
        return ResponseEntity.ok(ApiResponse.success(roster));
    }

    @PostMapping("/{id}/grade")
    public ResponseEntity<ApiResponse<SubmissionDto>> gradeSubmission(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> payload) {
        Double marks = payload.get("marks") != null ? Double.parseDouble(payload.get("marks").toString()) : 0.0;
        String feedback = payload.get("feedback") != null ? payload.get("feedback").toString() : "";
        UUID graderId = payload.get("graderId") != null ? UUID.fromString(payload.get("graderId").toString()) : null;

        SubmissionDto graded = facultySubmissionService.gradeSubmission(id, marks, feedback, graderId);
        return ResponseEntity.ok(ApiResponse.success(graded));
    }

    @PostMapping("/bulk-grade")
    public ResponseEntity<ApiResponse<List<BulkGradeResultDto>>> bulkGrade(
            @RequestBody List<BulkGradeItemDto> gradeArray) {
        List<BulkGradeResultDto> results = facultySubmissionService.bulkGradeSubmissions(gradeArray);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @PostMapping("/{id}/redo")
    public ResponseEntity<ApiResponse<RedoResponseDto>> redoSubmissionById(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> payload) {
        String reason = payload != null ? payload.getOrDefault("feedbackReason", payload.get("reason")) : "";
        RedoResponseDto response = facultySubmissionService.dispatchRedoRequest(id, reason);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/redo")
    public ResponseEntity<ApiResponse<RedoResponseDto>> redoSubmission(
            @RequestBody RedoRequestDto request) {
        RedoResponseDto response = facultySubmissionService.dispatchRedoRequest(
                request.getSubmissionId(), request.getReason());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
