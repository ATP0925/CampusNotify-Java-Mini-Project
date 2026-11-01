package com.campusnotify.academic.service;

import com.campusnotify.academic.dto.CoAttainmentResultDto;
import com.campusnotify.academic.dto.StudentQuestionScoreDto;
import com.campusnotify.entity.CoPoMatrix;
import com.campusnotify.repository.CoPoMatrixRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Feature 16: NAAC/NBA CO-PO Direct Attainment Engine.
 * Evaluates Course Outcomes (CO1..CO6) against direct target thresholds,
 * scales attainment into NBA 4-tier levels (Level 0: <50%, Level 1: 50-59.99%,
 * Level 2: 60-69.99%, Level 3: >=70%), and computes PO1-PO12 / PSO1-PSO2 direct mapping scores.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CoPoAttainmentService {

    private final CoPoMatrixRepository coPoMatrixRepository;

    /**
     * Calculates Course Outcome (CO) attainment level from student assessment question scores.
     * Scale:
     * - Level 3: >= 70.00% students meet threshold
     * - Level 2: 60.00% - 69.99% students meet threshold
     * - Level 1: 50.00% - 59.99% students meet threshold
     * - Level 0: < 50.00% students meet threshold
     */
    public CoAttainmentResultDto calculateCoAttainment(List<StudentQuestionScoreDto> scores, BigDecimal thresholdPct) {
        if (scores == null || scores.isEmpty()) {
            return CoAttainmentResultDto.builder()
                    .attainmentLevel(0)
                    .percentageMeetingThreshold(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                    .totalStudents(0)
                    .meetingCount(0)
                    .build();
        }

        if (thresholdPct == null) {
            thresholdPct = new BigDecimal("60.00");
        }

        int meetingCount = 0;
        for (StudentQuestionScoreDto item : scores) {
            if (item != null && item.getMaxScore() != null && item.getMaxScore().compareTo(BigDecimal.ZERO) > 0 && item.getScore() != null) {
                BigDecimal pct = item.getScore().multiply(new BigDecimal("100"))
                        .divide(item.getMaxScore(), 4, RoundingMode.HALF_UP);
                if (pct.compareTo(thresholdPct) >= 0) {
                    meetingCount++;
                }
            }
        }

        int totalStudents = scores.size();
        BigDecimal percentageMeeting = BigDecimal.valueOf(meetingCount)
                .multiply(new BigDecimal("100"))
                .divide(BigDecimal.valueOf(totalStudents), 2, RoundingMode.HALF_UP);

        int attainmentLevel;
        if (percentageMeeting.compareTo(new BigDecimal("70.00")) >= 0) {
            attainmentLevel = 3;
        } else if (percentageMeeting.compareTo(new BigDecimal("60.00")) >= 0) {
            attainmentLevel = 2;
        } else if (percentageMeeting.compareTo(new BigDecimal("50.00")) >= 0) {
            attainmentLevel = 1;
        } else {
            attainmentLevel = 0;
        }

        return CoAttainmentResultDto.builder()
                .attainmentLevel(attainmentLevel)
                .percentageMeetingThreshold(percentageMeeting)
                .totalStudents(totalStudents)
                .meetingCount(meetingCount)
                .build();
    }

    /**
     * Computes Program Outcome (PO) direct attainment weighted by CO-PO correlation levels.
     */
    public Map<String, BigDecimal> calculatePoAttainment(Map<String, Integer> coAttainmentLevels, List<CoPoMatrix> mappingMatrix) {
        Map<String, BigDecimal> weightedSums = new HashMap<>();
        Map<String, Integer> weightTotals = new HashMap<>();

        for (CoPoMatrix cell : mappingMatrix) {
            String coCode = cell.getCoCode();
            String poCode = cell.getPoCode();
            int correlation = cell.getCorrelationLevel();

            if (correlation > 0 && coAttainmentLevels.containsKey(coCode)) {
                int coLevel = coAttainmentLevels.get(coCode);
                BigDecimal contribution = BigDecimal.valueOf((long) coLevel * correlation);

                weightedSums.put(poCode, weightedSums.getOrDefault(poCode, BigDecimal.ZERO).add(contribution));
                weightTotals.put(poCode, weightTotals.getOrDefault(poCode, 0) + correlation);
            }
        }

        Map<String, BigDecimal> poAttainment = new HashMap<>();
        for (Map.Entry<String, BigDecimal> entry : weightedSums.entrySet()) {
            String po = entry.getKey();
            int totalWeight = weightTotals.getOrDefault(po, 0);
            if (totalWeight > 0) {
                BigDecimal score = entry.getValue().divide(BigDecimal.valueOf(totalWeight), 2, RoundingMode.HALF_UP);
                poAttainment.put(po, score);
            } else {
                poAttainment.put(po, BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
            }
        }

        return poAttainment;
    }

    @Transactional
    public CoPoMatrix saveMapping(CoPoMatrix matrix) {
        return coPoMatrixRepository.save(matrix);
    }

    @Transactional(readOnly = true)
    public List<CoPoMatrix> getMatrixForSubject(String subjectCode) {
        return coPoMatrixRepository.findBySubjectCode(subjectCode);
    }
}
