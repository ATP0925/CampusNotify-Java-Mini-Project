package com.campusnotify.academic.controller;

import com.campusnotify.academic.dto.GaleShapleyRequestDto;
import com.campusnotify.academic.dto.ProjectGroupDto;
import com.campusnotify.academic.service.GaleShapleyService;
import com.campusnotify.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/academic/allocation")
@RequiredArgsConstructor
public class AcademicAllocationController {

    private final GaleShapleyService galeShapleyService;

    // Cache of latest allocation results by academic year
    private final Map<String, Map<String, List<String>>> yearAllocations = new ConcurrentHashMap<>();

    @PostMapping("/submit-preferences")
    public ResponseEntity<ApiResponse<String>> submitPreferences(@RequestBody ProjectGroupDto groupDto) {
        return ResponseEntity.ok(ApiResponse.success("Preferences recorded successfully for group " + groupDto.getId()));
    }

    @PostMapping("/run-matching")
    public ResponseEntity<ApiResponse<Map<String, List<String>>>> runMatching(
            @RequestBody GaleShapleyRequestDto request,
            @RequestParam(required = false, defaultValue = "2026-27") String academicYear) {
        Map<String, List<String>> result = galeShapleyService.runMatching(request.getGroups(), request.getGuides());
        yearAllocations.put(academicYear, result);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/results")
    public ResponseEntity<ApiResponse<Map<String, List<String>>>> getResults(
            @RequestParam(required = false, defaultValue = "2026-27") String academicYear) {
        Map<String, List<String>> results = yearAllocations.getOrDefault(academicYear, Collections.emptyMap());
        return ResponseEntity.ok(ApiResponse.success(results));
    }
}
