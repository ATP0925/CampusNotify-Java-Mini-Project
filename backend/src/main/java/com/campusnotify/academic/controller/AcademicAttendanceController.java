package com.campusnotify.academic.controller;

import com.campusnotify.academic.dto.AttendanceSummaryDto;
import com.campusnotify.academic.service.AttendanceEngine;
import com.campusnotify.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/academic/attendance")
@RequiredArgsConstructor
public class AcademicAttendanceController {

    private final AttendanceEngine attendanceEngine;

    @GetMapping("/calculate")
    public ResponseEntity<ApiResponse<BigDecimal>> calculate(@RequestParam long attended,
                                                             @RequestParam long conducted) {
        BigDecimal pct = attendanceEngine.calculateAttendance(attended, conducted);
        return ResponseEntity.ok(ApiResponse.success(pct));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AttendanceSummaryDto>> getSummary(@RequestParam UUID studentId) {
        AttendanceSummaryDto summary = attendanceEngine.getAttendanceSummary(studentId);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @PostMapping("/aggregate")
    public ResponseEntity<ApiResponse<BigDecimal>> calculateAggregate(@RequestBody Map<String, Long> payload) {
        long totalAttended = payload.getOrDefault("totalAttended", 0L);
        long totalConducted = payload.getOrDefault("totalConducted", 0L);
        BigDecimal aggregate = attendanceEngine.calculateAggregateAttendance(totalAttended, totalConducted);
        return ResponseEntity.ok(ApiResponse.success(aggregate));
    }
}
