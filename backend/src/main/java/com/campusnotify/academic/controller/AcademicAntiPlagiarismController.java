package com.campusnotify.academic.controller;

import com.campusnotify.academic.dto.PlagiarismAnalysisRequestDto;
import com.campusnotify.academic.dto.PlagiarismAnalysisResultDto;
import com.campusnotify.academic.service.PlagiarismEngineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/academic/plagiarism")
@RequiredArgsConstructor
public class AcademicAntiPlagiarismController {

    private final PlagiarismEngineService plagiarismEngineService;

    @PostMapping("/analyze")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<PlagiarismAnalysisResultDto> analyzePlagiarism(@RequestBody PlagiarismAnalysisRequestDto request) {
        return ResponseEntity.ok(plagiarismEngineService.analyzePlagiarism(request));
    }
}

