package com.campusnotify.academic.service;

import com.campusnotify.academic.dto.TermWorkCalculationDto;
import com.campusnotify.entity.TermWorkRecord;
import com.campusnotify.repository.TermWorkRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Feature 14: Mumbai University 25-Mark Term Work Formula Engine.
 * TW (25M) = Attendance (5M) + Continuous Lab Assessment (15M) + Viva/Mini-Project (5M).
 * Scales attendance marks across dynamic bands, zeros defaulter attendance marks (<75%),
 * and accurately calculates continuous assessment out of 15 marks.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TermWorkService {

    private final TermWorkRecordRepository termWorkRecordRepository;

    /**
     * Calculates term work breakdown according to Mumbai University Ordinance 6086 formula.
     */
    public TermWorkCalculationDto calculateTermWork(BigDecimal attendancePct, List<BigDecimal> practicalMarks, BigDecimal vivaMark) {
        if (attendancePct == null) {
            attendancePct = BigDecimal.ZERO;
        }

        // 1. Attendance component (0-5 marks)
        BigDecimal attendanceMark;
        boolean isDefaulter = false;
        if (attendancePct.compareTo(new BigDecimal("90.00")) >= 0) {
            attendanceMark = new BigDecimal("5.00");
        } else if (attendancePct.compareTo(new BigDecimal("85.00")) >= 0) {
            attendanceMark = new BigDecimal("4.00");
        } else if (attendancePct.compareTo(new BigDecimal("80.00")) >= 0) {
            attendanceMark = new BigDecimal("3.00");
        } else if (attendancePct.compareTo(new BigDecimal("75.00")) >= 0) {
            attendanceMark = new BigDecimal("2.00");
        } else {
            attendanceMark = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
            isDefaulter = true;
        }

        // 2. Lab experiments continuous assessment component (0-15 marks)
        BigDecimal labMark = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        if (practicalMarks != null && !practicalMarks.isEmpty()) {
            BigDecimal totalScored = BigDecimal.ZERO;
            for (BigDecimal mark : practicalMarks) {
                if (mark != null) {
                    BigDecimal clamped = mark.max(BigDecimal.ZERO).min(new BigDecimal("10.00"));
                    totalScored = totalScored.add(clamped);
                }
            }
            BigDecimal maxPossible = BigDecimal.valueOf(practicalMarks.size() * 10L);
            labMark = totalScored.multiply(new BigDecimal("15.00"))
                    .divide(maxPossible, 2, RoundingMode.HALF_UP);
        }

        // 3. Viva / Mini-Project component (0-5 marks)
        BigDecimal validViva = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        if (vivaMark != null) {
            validViva = vivaMark.max(BigDecimal.ZERO).min(new BigDecimal("5.00")).setScale(2, RoundingMode.HALF_UP);
        }

        // Total Term Work (capped at 25.00)
        BigDecimal totalTW = attendanceMark.add(labMark).add(validViva)
                .min(new BigDecimal("25.00"))
                .setScale(2, RoundingMode.HALF_UP);

        return TermWorkCalculationDto.builder()
                .attendanceMark(attendanceMark)
                .labMark(labMark)
                .vivaMark(validViva)
                .totalTW(totalTW)
                .isDefaulter(isDefaulter)
                .build();
    }

    /**
     * Calculates term work and persists the result to the database.
     */
    @Transactional
    public TermWorkRecord calculateAndPersist(UUID studentId, String subjectCode, String academicYear,
                                             BigDecimal attendancePct, List<BigDecimal> practicalMarks, BigDecimal vivaMark) {
        TermWorkCalculationDto calc = calculateTermWork(attendancePct, practicalMarks, vivaMark);

        Optional<TermWorkRecord> existing = termWorkRecordRepository.findByStudentIdAndSubjectCode(studentId, subjectCode);
        TermWorkRecord record;
        if (existing.isPresent()) {
            record = existing.get();
        } else {
            record = TermWorkRecord.builder()
                    .studentId(studentId)
                    .subjectCode(subjectCode)
                    .academicYear(academicYear != null ? academicYear : "2026-27")
                    .build();
        }

        record.setAttendanceMarks(calc.getAttendanceMark());
        record.setLabMarks(calc.getLabMark());
        record.setVivaMarks(calc.getVivaMark());
        record.setTotalMarks(calc.getTotalTW());
        record.setDefaulter(calc.isDefaulter());
        record.setCalculatedAt(Instant.now());

        return termWorkRecordRepository.save(record);
    }

    @Transactional(readOnly = true)
    public Optional<TermWorkRecord> getRecord(UUID studentId, String subjectCode) {
        return termWorkRecordRepository.findByStudentIdAndSubjectCode(studentId, subjectCode);
    }
}
