package com.campusnotify.academic.controller;

import com.campusnotify.academic.dto.GrievanceRequestDto;
import com.campusnotify.academic.dto.GrievanceResultDto;
import com.campusnotify.academic.service.GrievanceRedressalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/academic/grievance")
@RequiredArgsConstructor
public class AcademicGrievanceController {

    private final GrievanceRedressalService grievanceRedressalService;

    @PostMapping("/file")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<GrievanceResultDto> fileGrievance(@RequestBody GrievanceRequestDto request) {
        return ResponseEntity.ok(grievanceRedressalService.fileGrievance(request));
    }
}
