package com.campusnotify.academic;

import com.campusnotify.academic.service.AttendanceEngine;
import com.campusnotify.repository.AttendanceRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class AttendanceEngineTest {

    @Mock
    private AttendanceRecordRepository attendanceRecordRepository;

    private AttendanceEngine attendanceEngine;

    @BeforeEach
    void setUp() {
        attendanceEngine = new AttendanceEngine(attendanceRecordRepository);
    }

    @Test
    @DisplayName("F12_T01: Computes exact 2-decimal truncation for 59/79 sessions as 74.68%")
    void testStrictTruncation59Over79() {
        // 59 / 79 = 0.746835443... Strict Ordinance 6086 truncates to 74.68%
        BigDecimal pct = attendanceEngine.calculateAttendance(59, 79);
        assertEquals(new BigDecimal("74.68"), pct, "Must strictly truncate to 74.68% without rounding up to 74.69% or 75.00%");
    }

    @Test
    @DisplayName("F12_T02: Computes 100% attendance when all conducted lectures are attended")
    void testFullAttendance() {
        BigDecimal pct = attendanceEngine.calculateAttendance(80, 80);
        assertEquals(new BigDecimal("100.00"), pct);
    }

    @Test
    @DisplayName("F12_T03: Computes 0.00% attendance when zero lectures attended")
    void testZeroAttended() {
        BigDecimal pct = attendanceEngine.calculateAttendance(0, 50);
        assertEquals(new BigDecimal("0.00"), pct);
    }

    @Test
    @DisplayName("F12_T04: Returns 0.00% safely when conducted count is zero (division by zero guard)")
    void testZeroConductedDivisionByZeroGuard() {
        BigDecimal pct = attendanceEngine.calculateAttendance(0, 0);
        assertEquals(new BigDecimal("0.00"), pct);
    }

    @Test
    @DisplayName("F12_T05: Clamps attended count if greater than conducted count")
    void testClampsOverAttendance() {
        BigDecimal pct = attendanceEngine.calculateAttendance(65, 60);
        assertEquals(new BigDecimal("100.00"), pct, "Attendance cannot exceed 100.00%");
    }

    @Test
    @DisplayName("F12_B01: Attended 1 of 1 session is 100.00%")
    void testBoundaryOneOfOne() {
        assertEquals(new BigDecimal("100.00"), attendanceEngine.calculateAttendance(1, 1));
    }

    @Test
    @DisplayName("F12_B02: Attended 0 of 1 session is 0.00%")
    void testBoundaryZeroOfOne() {
        assertEquals(new BigDecimal("0.00"), attendanceEngine.calculateAttendance(0, 1));
    }

    @Test
    @DisplayName("F12_B03: Attended 7499 of 10000 sessions truncates strictly to 74.99%")
    void testBoundary7499Of10000() {
        assertEquals(new BigDecimal("74.99"), attendanceEngine.calculateAttendance(7499, 10000));
    }

    @Test
    @DisplayName("F12_B04: Negative attended count clamped to 0.00%")
    void testBoundaryNegativeAttended() {
        assertEquals(new BigDecimal("0.00"), attendanceEngine.calculateAttendance(-5, 50));
    }

    @Test
    @DisplayName("F12_B05: Large conducted count (1,000,000) computed without precision loss")
    void testBoundaryLargeConducted() {
        assertEquals(new BigDecimal("85.00"), attendanceEngine.calculateAttendance(850000, 1000000));
    }
}
