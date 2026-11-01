package com.campusnotify.submission.controller;

import com.campusnotify.dto.ApiResponse;
import com.campusnotify.proctoring.dto.ProctoringEventDto;
import com.campusnotify.proctoring.dto.ProctoringViolationDto;
import com.campusnotify.proctoring.service.ProctoringService;
import com.campusnotify.submission.dto.DraftSyncRequestDto;
import com.campusnotify.submission.dto.SubmissionDto;
import com.campusnotify.submission.dto.SubmissionRequest;
import com.campusnotify.submission.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;
    private final ProctoringService proctoringService;

    @PostMapping
    public ResponseEntity<ApiResponse<SubmissionDto>> submitPractical(
            @RequestBody SubmissionRequest request) {
        SubmissionDto submission = submissionService.submitPractical(request);
        return ResponseEntity.ok(ApiResponse.success(submission));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubmissionDto>> getSubmission(@PathVariable UUID id) {
        SubmissionDto submission = submissionService.getSubmission(id);
        if (submission == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(submission));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<SubmissionDto>>> getStudentSubmissions(
            @PathVariable UUID studentId) {
        List<SubmissionDto> list = submissionService.getSubmissionsByStudent(studentId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/practical/{practicalId}")
    public ResponseEntity<ApiResponse<List<SubmissionDto>>> getPracticalSubmissions(
            @PathVariable UUID practicalId) {
        List<SubmissionDto> list = submissionService.getSubmissionsByPractical(practicalId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/draft-sync")
    public ResponseEntity<ApiResponse<DraftSyncRequestDto>> syncDraft(
            @RequestBody DraftSyncRequestDto draft) {
        DraftSyncRequestDto saved = submissionService.saveDraft(draft);
        return ResponseEntity.ok(ApiResponse.success(saved));
    }

    @PostMapping("/proctoring-event")
    public ResponseEntity<ApiResponse<ProctoringViolationDto>> logProctoringEvent(
            @RequestBody ProctoringEventDto event) {
        ProctoringViolationDto violation = proctoringService.logViolation(event);
        return ResponseEntity.ok(ApiResponse.success(violation));
    }
}
