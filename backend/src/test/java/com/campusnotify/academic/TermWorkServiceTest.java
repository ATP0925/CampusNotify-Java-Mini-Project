package com.campusnotify.academic;

import com.campusnotify.academic.dto.TermWorkCalculationDto;
import com.campusnotify.academic.service.TermWorkService;
import com.campusnotify.entity.TermWorkRecord;
import com.campusnotify.repository.TermWorkRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TermWorkServiceTest {

    @Mock
    private TermWorkRecordRepository termWorkRecordRepository;

    private TermWorkService termWorkService;

    @BeforeEach
    void setUp() {
        termWorkService = new TermWorkService(termWorkRecordRepository);
    }

    @Test
    @DisplayName("F14_T01: Awards full 25 marks for >=90% attendance, full lab, and full viva")
    void testFull25Marks() {
        List<BigDecimal> practicals = Collections.nCopies(10, new BigDecimal("10.00"));
        TermWorkCalculationDto tw = termWorkService.calculateTermWork(new BigDecimal("92.00"), practicals, new BigDecimal("5.00"));
        assertEquals(new BigDecimal("5.00"), tw.getAttendanceMark());
        assertEquals(new BigDecimal("15.00"), tw.getLabMark());
        assertEquals(new BigDecimal("5.00"), tw.getVivaMark());
        assertEquals(new BigDecimal("25.00"), tw.getTotalTW());
    }

    @Test
    @DisplayName("F14_T02: Scales attendance marks across bands (85-89.99%: 4M, 80-84.99%: 3M, 75-79.99%: 2M)")
    void testAttendanceBands() {
        List<BigDecimal> p = List.of(new BigDecimal("10.00"));
        assertEquals(new BigDecimal("4.00"), termWorkService.calculateTermWork(new BigDecimal("86.50"), p, BigDecimal.ZERO).getAttendanceMark());
        assertEquals(new BigDecimal("3.00"), termWorkService.calculateTermWork(new BigDecimal("81.00"), p, BigDecimal.ZERO).getAttendanceMark());
        assertEquals(new BigDecimal("2.00"), termWorkService.calculateTermWork(new BigDecimal("77.20"), p, BigDecimal.ZERO).getAttendanceMark());
    }

    @Test
    @DisplayName("F14_T03: Awards 0 attendance marks for defaulters (< 75.00%)")
    void testDefaulterZeroAttendance() {
        List<BigDecimal> practicals = List.of(new BigDecimal("10.00"), new BigDecimal("10.00"));
        TermWorkCalculationDto tw = termWorkService.calculateTermWork(new BigDecimal("74.99"), practicals, new BigDecimal("5.00"));
        assertEquals(new BigDecimal("0.00"), tw.getAttendanceMark());
        assertTrue(tw.isDefaulter());
    }

    @Test
    @DisplayName("F14_T04: Calculates continuous lab assessment out of 15 marks accurately")
    void testLabContinuousAssessment() {
        // 5 practicals scored 8 each => 80% => 12.00 out of 15
        List<BigDecimal> practicals = List.of(
                new BigDecimal("8.00"), new BigDecimal("8.00"),
                new BigDecimal("8.00"), new BigDecimal("8.00"), new BigDecimal("8.00")
        );
        TermWorkCalculationDto tw = termWorkService.calculateTermWork(new BigDecimal("95.00"), practicals, new BigDecimal("4.00"));
        assertEquals(new BigDecimal("12.00"), tw.getLabMark());
        assertEquals(new BigDecimal("21.00"), tw.getTotalTW()); // 5 + 12 + 4 = 21
    }

    @Test
    @DisplayName("F14_T05: Clamps viva marks to maximum 5 marks")
    void testClampsVivaMark() {
        TermWorkCalculationDto tw = termWorkService.calculateTermWork(new BigDecimal("95.00"), List.of(new BigDecimal("10.00")), new BigDecimal("8.00"));
        assertEquals(new BigDecimal("5.00"), tw.getVivaMark());
    }

    @Test
    @DisplayName("F14_B01: Attendance at 89.99% awards 4 marks (boundary just below 90%)")
    void testBoundary8999() {
        assertEquals(new BigDecimal("4.00"), termWorkService.calculateTermWork(new BigDecimal("89.99"), List.of(), BigDecimal.ZERO).getAttendanceMark());
    }

    @Test
    @DisplayName("F14_B02: Attendance at 84.99% awards 3 marks (boundary just below 85%)")
    void testBoundary8499() {
        assertEquals(new BigDecimal("3.00"), termWorkService.calculateTermWork(new BigDecimal("84.99"), List.of(), BigDecimal.ZERO).getAttendanceMark());
    }

    @Test
    @DisplayName("F14_B03: Attendance at 79.99% awards 2 marks (boundary just below 80%)")
    void testBoundary7999() {
        assertEquals(new BigDecimal("2.00"), termWorkService.calculateTermWork(new BigDecimal("79.99"), List.of(), BigDecimal.ZERO).getAttendanceMark());
    }

    @Test
    @DisplayName("F14_B04: Empty practical marks array yields 0 lab marks")
    void testBoundaryEmptyPracticals() {
        TermWorkCalculationDto tw = termWorkService.calculateTermWork(new BigDecimal("95.00"), List.of(), new BigDecimal("5.00"));
        assertEquals(new BigDecimal("0.00"), tw.getLabMark());
        assertEquals(new BigDecimal("10.00"), tw.getTotalTW()); // 5 + 0 + 5
    }

    @Test
    @DisplayName("F14_B05: Floating-point practical marks (e.g. 9.5) compute accurately")
    void testBoundaryFloatingMarks() {
        TermWorkCalculationDto tw = termWorkService.calculateTermWork(new BigDecimal("90.00"), List.of(new BigDecimal("9.50"), new BigDecimal("9.50")), new BigDecimal("4.00"));
        // (19 / 20) * 15 = 14.25
        assertEquals(new BigDecimal("14.25"), tw.getLabMark());
        assertEquals(new BigDecimal("23.25"), tw.getTotalTW()); // 5 + 14.25 + 4
    }

    @Test
    @DisplayName("F14_Persist: Persists TermWorkRecord to repository")
    void testPersistTermWorkRecord() {
        UUID studentId = UUID.randomUUID();
        when(termWorkRecordRepository.save(any(TermWorkRecord.class))).thenAnswer(i -> i.getArgument(0));

        TermWorkRecord saved = termWorkService.calculateAndPersist(
                studentId, "CS401", "2026-27",
                new BigDecimal("95.00"), List.of(new BigDecimal("10.00")), new BigDecimal("5.00")
        );

        assertNotNull(saved);
        assertEquals(studentId, saved.getStudentId());
        assertEquals(new BigDecimal("25.00"), saved.getTotalMarks());
        verify(termWorkRecordRepository).save(any(TermWorkRecord.class));
    }
}
