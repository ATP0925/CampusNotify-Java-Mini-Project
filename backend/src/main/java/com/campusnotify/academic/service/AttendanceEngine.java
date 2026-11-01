package com.campusnotify.academic.service;

import com.campusnotify.academic.dto.AttendanceSummaryDto;
import com.campusnotify.entity.AttendanceRecord;
import com.campusnotify.repository.AttendanceRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

/**
 * Feature 12: Mumbai University Ordinance 6086 Attendance Engine.
 * Enforces strict 2-decimal truncation logic using BigDecimal to prevent rounding inflation.
 * (e.g. 59/79 = 74.68%, never rounded up to 74.69% or 75.00%).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceEngine {

    private final AttendanceRecordRepository attendanceRecordRepository;

    /**
     * Computes strictly truncated 2-decimal attendance percentage.
     * Formula: floor((attended / conducted) * 10000) / 100
     */
    public BigDecimal calculateAttendance(long attended, long conducted) {
        if (conducted <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.DOWN);
        }
        if (attended < 0) {
            attended = 0;
        }
        if (attended > conducted) {
            attended = conducted;
        }

        BigDecimal att = BigDecimal.valueOf(attended);
        BigDecimal cond = BigDecimal.valueOf(conducted);

        return att.multiply(BigDecimal.valueOf(100))
                .divide(cond, 6, RoundingMode.DOWN)
                .setScale(2, RoundingMode.DOWN);
    }

    public BigDecimal calculateAttendance(int attended, int conducted) {
        return calculateAttendance((long) attended, (long) conducted);
    }

    /**
     * Computes aggregate attendance across multiple subject records.
     */
    public BigDecimal calculateAggregateAttendance(long totalAttended, long totalConducted) {
        return calculateAttendance(totalAttended, totalConducted);
    }

    /**
     * Generates comprehensive attendance summary for a student using database records.
     */
    @Transactional(readOnly = true)
    public AttendanceSummaryDto getAttendanceSummary(UUID studentId) {
        List<AttendanceRecord> records = attendanceRecordRepository.findByStudentId(studentId);
        if (records.isEmpty()) {
            return AttendanceSummaryDto.builder()
                    .studentId(studentId)
                    .attended(0)
                    .conducted(0)
                    .rawPercentage(BigDecimal.ZERO.setScale(2, RoundingMode.DOWN))
                    .effectivePercentage(BigDecimal.ZERO.setScale(2, RoundingMode.DOWN))
                    .medicalGraceApplied(BigDecimal.ZERO.setScale(2, RoundingMode.DOWN))
                    .isDefaulter(true)
                    .tier("D1")
                    .build();
        }

        long conducted = records.size();
        long attended = records.stream()
                .filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus()) 
                          || "DUTY_LEAVE".equalsIgnoreCase(r.getStatus()) 
                          || "GRACE_BONUS".equalsIgnoreCase(r.getStatus()))
                .count();

        long medicalRecords = records.stream()
                .filter(r -> "MEDICAL_LEAVE".equalsIgnoreCase(r.getStatus()))
                .count();

        BigDecimal rawPct = calculateAttendance(attended, conducted);
        
        // Calculate medical leave percentage
        BigDecimal medicalPct = calculateAttendance(medicalRecords, conducted);
        BigDecimal medicalGraceApplied = BigDecimal.ZERO.setScale(2, RoundingMode.DOWN);
        BigDecimal effectivePct = rawPct;

        // Mumbai University 15% medical grace rule: raw attendance must be >= 60.00%
        if (rawPct.compareTo(new BigDecimal("60.00")) >= 0 && medicalPct.compareTo(BigDecimal.ZERO) > 0) {
            medicalGraceApplied = medicalPct.min(new BigDecimal("15.00")).setScale(2, RoundingMode.DOWN);
            effectivePct = rawPct.add(medicalGraceApplied).min(new BigDecimal("100.00")).setScale(2, RoundingMode.DOWN);
        }

        boolean isDefaulter = effectivePct.compareTo(new BigDecimal("75.00")) < 0;
        String tier = null;
        if (isDefaulter) {
            tier = "D1"; // Baseline default for summary
        }

        return AttendanceSummaryDto.builder()
                .studentId(studentId)
                .attended(attended)
                .conducted(conducted)
                .rawPercentage(rawPct)
                .effectivePercentage(effectivePct)
                .medicalGraceApplied(medicalGraceApplied)
                .isDefaulter(isDefaulter)
                .tier(tier)
                .build();
    }
}
