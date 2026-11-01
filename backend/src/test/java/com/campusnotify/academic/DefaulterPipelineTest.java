package com.campusnotify.academic;

import com.campusnotify.academic.dto.DefaulterEvaluationDto;
import com.campusnotify.academic.service.DefaulterPipelineService;
import com.campusnotify.entity.HallTicket;
import com.campusnotify.repository.HallTicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DefaulterPipelineTest {

    @Mock
    private HallTicketRepository hallTicketRepository;

    private DefaulterPipelineService defaulterPipelineService;

    @BeforeEach
    void setUp() {
        defaulterPipelineService = new DefaulterPipelineService(hallTicketRepository);
    }

    @Test
    @DisplayName("F13_T01: Triggers D1 in-app warning on Day 30 checkpoint for attendance < 75%")
    void testDay30WarningD1() {
        DefaulterEvaluationDto res = defaulterPipelineService.evaluateDefaulter(new BigDecimal("72.50"), 30);
        assertTrue(res.isDefaulter());
        assertEquals("D1", res.getTier());
        assertTrue(res.getActions().contains("STUDENT_IN_APP_WARNING"));
    }

    @Test
    @DisplayName("F13_T02: Triggers D2 collegiate warning & parent intimation on Day 60 checkpoint")
    void testDay60ParentIntimationD2() {
        DefaulterEvaluationDto res = defaulterPipelineService.evaluateDefaulter(new BigDecimal("68.00"), 60);
        assertTrue(res.isDefaulter());
        assertEquals("D2", res.getTier());
        assertTrue(res.getActions().contains("DISPATCH_PARENT_INTIMATION"));
    }

    @Test
    @DisplayName("F13_T03: Triggers D3 final debarment & locks hall ticket on Day 90 checkpoint")
    void testDay90HallTicketLockD3() {
        DefaulterEvaluationDto res = defaulterPipelineService.evaluateDefaulter(new BigDecimal("62.00"), 90);
        assertTrue(res.isDefaulter());
        assertEquals("D3", res.getTier());
        assertTrue(res.getActions().contains("LOCK_EXAM_HALL_TICKET"));
    }

    @Test
    @DisplayName("F13_T04: Clears student from defaulter status when attendance >= 75.00%")
    void testClearedAttendance75() {
        DefaulterEvaluationDto res = defaulterPipelineService.evaluateDefaulter(new BigDecimal("75.00"), 90);
        assertFalse(res.isDefaulter());
        assertNull(res.getTier());
    }

    @Test
    @DisplayName("F13_T05: Applies medical leave grace up to 15% cap if raw attendance >= 60%")
    void testMedicalGraceApplied() {
        // Raw 64% + 12% medical = 76% (cleared from defaulter list)
        DefaulterEvaluationDto res = defaulterPipelineService.evaluateDefaulter(new BigDecimal("64.00"), 90, new BigDecimal("12.00"));
        assertEquals(new BigDecimal("76.00"), res.getEffectivePct());
        assertFalse(res.isDefaulter());
    }

    @Test
    @DisplayName("F13_B01: Exactly 74.99% attendance is classified as defaulter")
    void testBoundary7499IsDefaulter() {
        DefaulterEvaluationDto res = defaulterPipelineService.evaluateDefaulter(new BigDecimal("74.99"), 30);
        assertTrue(res.isDefaulter());
    }

    @Test
    @DisplayName("F13_B02: Exactly 75.00% attendance is cleared from defaulter list")
    void testBoundary7500NotDefaulter() {
        DefaulterEvaluationDto res = defaulterPipelineService.evaluateDefaulter(new BigDecimal("75.00"), 30);
        assertFalse(res.isDefaulter());
    }

    @Test
    @DisplayName("F13_B03: Medical leave grace exceeding 15% capped at 15.00%")
    void testMedicalGraceExceeding15Capped() {
        // 60% raw + 20% medical => 60% + 15% = 75.00%
        DefaulterEvaluationDto res = defaulterPipelineService.evaluateDefaulter(new BigDecimal("60.00"), 90, new BigDecimal("20.00"));
        assertEquals(new BigDecimal("75.00"), res.getEffectivePct());
        assertFalse(res.isDefaulter());
    }

    @Test
    @DisplayName("F13_B04: Raw attendance at 59.99% denied medical grace and remains defaulter")
    void testMedicalGraceDeniedUnder60() {
        DefaulterEvaluationDto res = defaulterPipelineService.evaluateDefaulter(new BigDecimal("59.99"), 90, new BigDecimal("15.00"));
        assertTrue(res.isDefaulter(), "Raw attendance < 60% cannot use medical grace");
        assertEquals(new BigDecimal("59.99"), res.getEffectivePct());
    }

    @Test
    @DisplayName("F13_B05: Checkpoint at Day 29 (before D1 Day 30) produces no tier action")
    void testDay29NoTierAction() {
        DefaulterEvaluationDto res = defaulterPipelineService.evaluateDefaulter(new BigDecimal("50.00"), 29);
        assertTrue(res.isDefaulter());
        assertNull(res.getTier());
        assertTrue(res.getActions().isEmpty());
    }

    @Test
    @DisplayName("F13_Lock: Locks existing hall ticket in database on D3")
    void testLockHallTicketInDb() {
        UUID studentId = UUID.randomUUID();
        HallTicket ticket = HallTicket.builder()
                .studentId(studentId)
                .isLocked(false)
                .build();
        when(hallTicketRepository.findByStudentId(studentId)).thenReturn(Optional.of(ticket));

        defaulterPipelineService.lockHallTicketForD3(studentId, "ATTENDANCE_DEFICIT");

        assertTrue(ticket.isLocked());
        assertEquals("ATTENDANCE_DEFICIT", ticket.getLockReason());
        verify(hallTicketRepository).save(ticket);
    }
}
