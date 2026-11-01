package com.campusnotify.academic.controller;

import com.campusnotify.academic.dto.FacultyCandidateDto;
import com.campusnotify.academic.dto.SwapRequestDto;
import com.campusnotify.academic.dto.TimetableSlotDto;
import com.campusnotify.academic.service.LectureSubstitutionService;
import com.campusnotify.academic.service.LectureSubstitutionService.InMemorySwap;
import com.campusnotify.academic.service.LectureSubstitutionService.SubstitutionApprovalResult;
import com.campusnotify.dto.ApiResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/academic/substitutions")
@RequiredArgsConstructor
public class AcademicSubstitutionController {

    private final LectureSubstitutionService lectureSubstitutionService;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EligibleSubstituteRequest {
        private TimetableSlotDto slot;
        private List<FacultyCandidateDto> facultyList;
    }

    @PostMapping("/eligible")
    public ResponseEntity<ApiResponse<List<FacultyCandidateDto>>> findEligible(
            @RequestBody EligibleSubstituteRequest request) {
        List<FacultyCandidateDto> eligible = lectureSubstitutionService.findEligibleSubstitutes(
                request.getSlot(), request.getFacultyList()
        );
        return ResponseEntity.ok(ApiResponse.success(eligible));
    }

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<InMemorySwap>> requestSwap(@RequestBody SwapRequestDto request) {
        InMemorySwap swap = lectureSubstitutionService.requestSwap(
                request.getSlotId(),
                request.getRequestingFacultyId(),
                request.getSubstituteFacultyId(),
                request.getReason()
        );
        return ResponseEntity.ok(ApiResponse.success(swap));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<InMemorySwap>> acceptSwap(@PathVariable String id) {
        InMemorySwap swap = lectureSubstitutionService.acceptSwap(id);
        return ResponseEntity.ok(ApiResponse.success(swap));
    }

    @PutMapping("/{id}/approve-hod")
    public ResponseEntity<ApiResponse<SubstitutionApprovalResult>> approveSwapByHod(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> payload) {
        String hodId = payload != null ? payload.getOrDefault("hodId", "HOD_ADMIN") : "HOD_ADMIN";
        SubstitutionApprovalResult result = lectureSubstitutionService.approveSwapByHod(id, hodId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InMemorySwap>> getSwap(@PathVariable String id) {
        InMemorySwap swap = lectureSubstitutionService.getSwap(id);
        if (swap == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(swap));
    }
}
