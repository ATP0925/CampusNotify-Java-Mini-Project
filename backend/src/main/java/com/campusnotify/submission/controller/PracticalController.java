package com.campusnotify.submission.controller;

import com.campusnotify.dto.ApiResponse;
import com.campusnotify.submission.dto.CreatePracticalRequest;
import com.campusnotify.submission.dto.ParameterizedSpecDto;
import com.campusnotify.submission.dto.PracticalDto;
import com.campusnotify.submission.service.PracticalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/practicals")
@RequiredArgsConstructor
public class PracticalController {

    private final PracticalService practicalService;

    @PostMapping
    public ResponseEntity<ApiResponse<PracticalDto>> createPractical(
            @RequestBody CreatePracticalRequest request) {
        PracticalDto practical = practicalService.createPractical(request);
        return ResponseEntity.ok(ApiResponse.success(practical));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PracticalDto>>> listPracticals(
            @RequestParam(required = false) String subjectCode) {
        List<PracticalDto> list = practicalService.listPracticals(subjectCode);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PracticalDto>> getPractical(@PathVariable UUID id) {
        PracticalDto practical = practicalService.getPractical(id);
        if (practical == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(practical));
    }

    @GetMapping("/{id}/parameterized-spec")
    public ResponseEntity<ApiResponse<ParameterizedSpecDto>> getParameterizedSpec(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID studentId,
            @RequestParam(required = false) String rollNo,
            @RequestParam(required = false) String prn) {
        ParameterizedSpecDto spec = practicalService.getParameterizedSpec(id, studentId, rollNo, prn);
        return ResponseEntity.ok(ApiResponse.success(spec));
    }
}
