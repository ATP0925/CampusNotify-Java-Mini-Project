package com.campusnotify.academic.controller;

import com.campusnotify.academic.dto.*;
import com.campusnotify.academic.service.ExamCellService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/academic/exam")
@RequiredArgsConstructor
public class AcademicExaminationController {

    private final ExamCellService examCellService;

    @PostMapping("/validate-eligibility")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<ExamEligibilityResultDto> validateEligibility(@RequestBody ExamEligibilityRequestDto request) {
        return ResponseEntity.ok(examCellService.validateEligibility(request));
    }

    @PostMapping("/reval-reconcile")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<RevalReconciliationResultDto> reconcileReval(@RequestBody RevalReconciliationRequestDto request) {
        return ResponseEntity.ok(examCellService.reconcileReval(request));
    }

    @PostMapping("/allocate-grace")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<NssGraceMarksResultDto> allocateGrace(@RequestBody NssGraceMarksRequestDto request) {
        return ResponseEntity.ok(examCellService.allocateNssGraceMarks(request));
    }
}
