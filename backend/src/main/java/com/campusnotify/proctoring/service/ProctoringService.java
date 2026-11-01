package com.campusnotify.proctoring.service;

import com.campusnotify.entity.ProctoringViolation;
import com.campusnotify.proctoring.dto.ProctoringEventDto;
import com.campusnotify.proctoring.dto.ProctoringSummaryDto;
import com.campusnotify.proctoring.dto.ProctoringViolationDto;
import com.campusnotify.proctoring.repository.ProctoringViolationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProctoringService {

    private final ProctoringViolationRepository violationRepository;
    private final TypingDynamicsService typingDynamicsService;

    @Transactional
    public ProctoringViolationDto logViolation(ProctoringEventDto eventDto) {
        if (eventDto.getViolationType() == null || eventDto.getViolationType().isBlank()) {
            eventDto.setViolationType("GENERAL_ANOMALY");
        }

        double velocity = eventDto.getVelocityCharsPerSec() != null ?
                eventDto.getVelocityCharsPerSec() :
                (eventDto.getTimeDeltaMs() > 0 ?
                        (double) eventDto.getCharacterDelta() / (eventDto.getTimeDeltaMs() / 1000.0) :
                        eventDto.getCharacterDelta());

        ProctoringViolation violation = ProctoringViolation.builder()
                .submissionId(eventDto.getSubmissionId())
                .studentId(eventDto.getStudentId())
                .violationType(eventDto.getViolationType())
                .characterDelta(eventDto.getCharacterDelta())
                .timeDeltaMs(eventDto.getTimeDeltaMs())
                .velocityCharsPerSec(velocity)
                .metadataJson(eventDto.getMetadataJson())
                .timestamp(Instant.now())
                .build();

        ProctoringViolation saved = violationRepository.save(violation);
        log.warn("Logged proctoring violation [{}] for student [{}] on submission [{}]",
                saved.getViolationType(), saved.getStudentId(), saved.getSubmissionId());

        return mapToDto(saved);
    }

    @Transactional
    public ProctoringViolationDto recordFocusLost(UUID submissionId, UUID studentId, long durationMs) {
        ProctoringEventDto event = ProctoringEventDto.builder()
                .submissionId(submissionId)
                .studentId(studentId)
                .violationType("FOCUS_LOST")
                .timeDeltaMs(durationMs)
                .characterDelta(0)
                .metadataJson("{\"focusLostDurationMs\":" + durationMs + "}")
                .build();
        return logViolation(event);
    }

    @Transactional(readOnly = true)
    public List<ProctoringViolationDto> getViolationsBySubmission(UUID submissionId) {
        return violationRepository.findBySubmissionIdOrderByTimestampAsc(submissionId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProctoringSummaryDto getProctoringSummary(UUID submissionId) {
        List<ProctoringViolation> violations = violationRepository.findBySubmissionIdOrderByTimestampAsc(submissionId);
        int totalViolations = violations.size();

        int focusLostCount = 0;
        long totalFocusLostDurationMs = 0;
        int burstInjectionCount = 0;

        for (ProctoringViolation v : violations) {
            if ("FOCUS_LOST".equalsIgnoreCase(v.getViolationType())) {
                focusLostCount++;
                totalFocusLostDurationMs += v.getTimeDeltaMs();
            } else if ("BURST_INJECTION_DETECTED".equalsIgnoreCase(v.getViolationType())) {
                burstInjectionCount++;
            }
        }

        // Integrity Score Calculation: starts at 100.0
        // Focus loss > 3 times: 5 points each
        // Burst injection: 25 points each
        // External paste anomaly: 15 points each
        double penalty = (burstInjectionCount * 25.0) +
                (focusLostCount > 2 ? (focusLostCount - 2) * 5.0 : 0.0) +
                (totalFocusLostDurationMs > 30000 ? 10.0 : 0.0);
        double integrityScore = Math.max(0.0, 100.0 - penalty);

        // Grade penalty deduction (0 to 5 marks max deduction on practical)
        double penaltyDeduction = Math.min(5.0, (burstInjectionCount * 2.0) + (focusLostCount * 0.5));

        boolean flagForReview = burstInjectionCount > 0 || focusLostCount >= 3 || totalFocusLostDurationMs > 30000;

        return ProctoringSummaryDto.builder()
                .submissionId(submissionId)
                .totalViolations(totalViolations)
                .focusLostCount(focusLostCount)
                .totalFocusLostDurationMs(totalFocusLostDurationMs)
                .burstInjectionCount(burstInjectionCount)
                .integrityScore(integrityScore)
                .penaltyDeduction(penaltyDeduction)
                .flagForReview(flagForReview)
                .build();
    }

    private ProctoringViolationDto mapToDto(ProctoringViolation entity) {
        return ProctoringViolationDto.builder()
                .id(entity.getId())
                .submissionId(entity.getSubmissionId())
                .studentId(entity.getStudentId())
                .violationType(entity.getViolationType())
                .characterDelta(entity.getCharacterDelta())
                .timeDeltaMs(entity.getTimeDeltaMs())
                .velocityCharsPerSec(entity.getVelocityCharsPerSec())
                .metadataJson(entity.getMetadataJson())
                .timestamp(entity.getTimestamp())
                .build();
    }
}
