package com.campusnotify.academic.controller;

import com.campusnotify.academic.dto.PlacementEligibilityRequestDto;
import com.campusnotify.academic.dto.PlacementEligibilityResultDto;
import com.campusnotify.academic.service.PlacementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/academic/placement")
@RequiredArgsConstructor
public class AcademicPlacementController {

    private final PlacementService placementService;

    @PostMapping("/evaluate-eligibility")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<PlacementEligibilityResultDto> evaluateEligibility(@RequestBody PlacementEligibilityRequestDto request) {
        return ResponseEntity.ok(placementService.evaluateDriveEligibility(request));
    }
}

