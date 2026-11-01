package com.campusnotify.proctoring;

import com.campusnotify.entity.ProctoringViolation;
import com.campusnotify.proctoring.dto.ProctoringEventDto;
import com.campusnotify.proctoring.dto.ProctoringSummaryDto;
import com.campusnotify.proctoring.dto.ProctoringViolationDto;
import com.campusnotify.proctoring.repository.ProctoringViolationRepository;
import com.campusnotify.proctoring.service.ProctoringService;
import com.campusnotify.proctoring.service.TypingDynamicsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProctoringServiceTest {

    @Mock
    private ProctoringViolationRepository violationRepository;

    private ProctoringService proctoringService;

    @BeforeEach
    void setUp() {
        TypingDynamicsService typingDynamicsService = new TypingDynamicsService();
        proctoringService = new ProctoringService(violationRepository, typingDynamicsService);
    }

    @Test
    @DisplayName("Proctoring: Logs violation event and persists to repository")
    void testLogViolation() {
        UUID submissionId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        ProctoringViolation savedViolation = ProctoringViolation.builder()
                .submissionId(submissionId)
                .studentId(studentId)
                .violationType("BURST_INJECTION_DETECTED")
                .characterDelta(120)
                .timeDeltaMs(40)
                .velocityCharsPerSec(3000.0)
                .timestamp(Instant.now())
                .build();
        savedViolation.setId(UUID.randomUUID());

        when(violationRepository.save(any(ProctoringViolation.class))).thenReturn(savedViolation);

        ProctoringEventDto event = ProctoringEventDto.builder()
                .submissionId(submissionId)
                .studentId(studentId)
                .violationType("BURST_INJECTION_DETECTED")
                .characterDelta(120)
                .timeDeltaMs(40)
                .build();

        ProctoringViolationDto dto = proctoringService.logViolation(event);

        assertNotNull(dto);
        assertEquals("BURST_INJECTION_DETECTED", dto.getViolationType());
        assertEquals(submissionId, dto.getSubmissionId());
        assertEquals(120, dto.getCharacterDelta());
    }

    @Test
    @DisplayName("Proctoring: Records focus lost event with duration metadata")
    void testRecordFocusLost() {
        UUID submissionId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        ProctoringViolation saved = ProctoringViolation.builder()
                .submissionId(submissionId)
                .studentId(studentId)
                .violationType("FOCUS_LOST")
                .timeDeltaMs(5000)
                .characterDelta(0)
                .metadataJson("{\"focusLostDurationMs\":5000}")
                .timestamp(Instant.now())
                .build();
        saved.setId(UUID.randomUUID());

        when(violationRepository.save(any(ProctoringViolation.class))).thenReturn(saved);

        ProctoringViolationDto res = proctoringService.recordFocusLost(submissionId, studentId, 5000);

        assertNotNull(res);
        assertEquals("FOCUS_LOST", res.getViolationType());
        assertEquals(5000, res.getTimeDeltaMs());
    }

    @Test
    @DisplayName("Proctoring: Computes integrity summary and penalty deduction correctly")
    void testProctoringSummary() {
        UUID submissionId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        ProctoringViolation v1 = ProctoringViolation.builder()
                .submissionId(submissionId)
                .studentId(studentId)
                .violationType("FOCUS_LOST")
                .timeDeltaMs(6000)
                .build();

        ProctoringViolation v2 = ProctoringViolation.builder()
                .submissionId(submissionId)
                .studentId(studentId)
                .violationType("FOCUS_LOST")
                .timeDeltaMs(8000)
                .build();

        ProctoringViolation v3 = ProctoringViolation.builder()
                .submissionId(submissionId)
                .studentId(studentId)
                .violationType("FOCUS_LOST")
                .timeDeltaMs(10000)
                .build();

        ProctoringViolation v4 = ProctoringViolation.builder()
                .submissionId(submissionId)
                .studentId(studentId)
                .violationType("BURST_INJECTION_DETECTED")
                .characterDelta(300)
                .timeDeltaMs(50)
                .build();

        when(violationRepository.findBySubmissionIdOrderByTimestampAsc(submissionId))
                .thenReturn(List.of(v1, v2, v3, v4));

        ProctoringSummaryDto summary = proctoringService.getProctoringSummary(submissionId);

        assertEquals(4, summary.getTotalViolations());
        assertEquals(3, summary.getFocusLostCount());
        assertEquals(24000, summary.getTotalFocusLostDurationMs());
        assertEquals(1, summary.getBurstInjectionCount());
        assertTrue(summary.getIntegrityScore() < 100.0);
        assertTrue(summary.isFlagForReview());
        assertTrue(summary.getPenaltyDeduction() > 0.0);
    }
}
