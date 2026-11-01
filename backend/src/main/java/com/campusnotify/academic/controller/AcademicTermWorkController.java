package com.campusnotify.academic.controller;

import com.campusnotify.academic.dto.TermWorkCalculationDto;
import com.campusnotify.academic.dto.TermWorkRequestDto;
import com.campusnotify.academic.service.TermWorkService;
import com.campusnotify.dto.ApiResponse;
import com.campusnotify.entity.TermWorkRecord;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/academic/termwork")
@RequiredArgsConstructor
public class AcademicTermWorkController {

    private final TermWorkService termWorkService;

    @PostMapping("/calculate")
    public ResponseEntity<ApiResponse<TermWorkCalculationDto>> calculatePost(@RequestBody TermWorkRequestDto request) {
        TermWorkCalculationDto result = termWorkService.calculateTermWork(
                request.getAttendancePct(),
                request.getPracticalMarks(),
                request.getVivaMark()
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/calculate")
    public ResponseEntity<ApiResponse<TermWorkCalculationDto>> calculateGet(
            @RequestParam UUID studentId,
            @RequestParam(required = false, defaultValue = "CS401") String subjectId) {
        Optional<TermWorkRecord> optRecord = termWorkService.getRecord(studentId, subjectId);
        if (optRecord.isPresent()) {
            TermWorkRecord rec = optRecord.get();
            TermWorkCalculationDto dto = TermWorkCalculationDto.builder()
                    .attendanceMark(rec.getAttendanceMarks())
                    .labMark(rec.getLabMarks())
                    .vivaMark(rec.getVivaMarks())
                    .totalTW(rec.getTotalMarks())
                    .isDefaulter(rec.isDefaulter())
                    .build();
            return ResponseEntity.ok(ApiResponse.success(dto));
        }

        // Return baseline calculation if not yet persisted
        TermWorkCalculationDto fallback = termWorkService.calculateTermWork(
                BigDecimal.ZERO, null, BigDecimal.ZERO
        );
        return ResponseEntity.ok(ApiResponse.success(fallback));
    }

    @PostMapping("/persist")
    public ResponseEntity<ApiResponse<TermWorkRecord>> persistRecord(@RequestBody TermWorkRequestDto request) {
        TermWorkRecord saved = termWorkService.calculateAndPersist(
                request.getStudentId(),
                request.getSubjectCode(),
                request.getAcademicYear(),
                request.getAttendancePct(),
                request.getPracticalMarks(),
                request.getVivaMark()
        );
        return ResponseEntity.ok(ApiResponse.success(saved));
    }
}
