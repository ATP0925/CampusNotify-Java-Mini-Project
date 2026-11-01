package com.campusnotify.academic;

import com.campusnotify.academic.dto.CoAttainmentResultDto;
import com.campusnotify.academic.dto.StudentQuestionScoreDto;
import com.campusnotify.academic.service.CoPoAttainmentService;
import com.campusnotify.entity.CoPoMatrix;
import com.campusnotify.repository.CoPoMatrixRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class CoPoAttainmentTest {

    @Mock
    private CoPoMatrixRepository coPoMatrixRepository;

    private CoPoAttainmentService coPoAttainmentService;

    @BeforeEach
    void setUp() {
        coPoAttainmentService = new CoPoAttainmentService(coPoMatrixRepository);
    }

    @Test
    @DisplayName("F16_T01: Achieves Attainment Level 3 when >=70% students score >=60%")
    void testAttainmentLevel3() {
        // 10 students: 8 score >= 6/10 (80%), 2 score < 6
        List<StudentQuestionScoreDto> scores = List.of(
                StudentQuestionScoreDto.builder().score(new BigDecimal("8.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("9.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("7.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("6.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("7.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("8.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("9.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("6.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("4.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("3.00")).maxScore(new BigDecimal("10.00")).build()
        );

        CoAttainmentResultDto res = coPoAttainmentService.calculateCoAttainment(scores, new BigDecimal("60.00"));
        assertEquals(3, res.getAttainmentLevel());
        assertEquals(new BigDecimal("80.00"), res.getPercentageMeetingThreshold());
    }

    @Test
    @DisplayName("F16_T02: Achieves Attainment Level 2 when 60-69.99% students meet threshold")
    void testAttainmentLevel2() {
        // 6 out of 10 score >= 6
        List<StudentQuestionScoreDto> scores = List.of(
                StudentQuestionScoreDto.builder().score(new BigDecimal("8.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("7.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("6.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("6.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("7.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("8.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("3.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("4.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("5.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("2.00")).maxScore(new BigDecimal("10.00")).build()
        );

        CoAttainmentResultDto res = coPoAttainmentService.calculateCoAttainment(scores, new BigDecimal("60.00"));
        assertEquals(2, res.getAttainmentLevel());
        assertEquals(new BigDecimal("60.00"), res.getPercentageMeetingThreshold());
    }

    @Test
    @DisplayName("F16_T03: Achieves Attainment Level 1 when 50-59.99% students meet threshold")
    void testAttainmentLevel1() {
        // 5 out of 10 score >= 6
        List<StudentQuestionScoreDto> scores = List.of(
                StudentQuestionScoreDto.builder().score(new BigDecimal("6.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("7.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("8.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("9.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("6.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("4.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("4.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("4.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("3.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("2.00")).maxScore(new BigDecimal("10.00")).build()
        );

        CoAttainmentResultDto res = coPoAttainmentService.calculateCoAttainment(scores, new BigDecimal("60.00"));
        assertEquals(1, res.getAttainmentLevel());
        assertEquals(new BigDecimal("50.00"), res.getPercentageMeetingThreshold());
    }

    @Test
    @DisplayName("F16_T04: Achieves Attainment Level 0 when <50% students meet threshold")
    void testAttainmentLevel0() {
        // 2 out of 10 score >= 6
        List<StudentQuestionScoreDto> scores = List.of(
                StudentQuestionScoreDto.builder().score(new BigDecimal("8.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("7.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("2.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("3.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("4.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("5.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("1.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("2.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("4.00")).maxScore(new BigDecimal("10.00")).build(),
                StudentQuestionScoreDto.builder().score(new BigDecimal("3.00")).maxScore(new BigDecimal("10.00")).build()
        );

        CoAttainmentResultDto res = coPoAttainmentService.calculateCoAttainment(scores, new BigDecimal("60.00"));
        assertEquals(0, res.getAttainmentLevel());
        assertEquals(new BigDecimal("20.00"), res.getPercentageMeetingThreshold());
    }

    @Test
    @DisplayName("F16_T05: Handles empty question scores list safely with level 0")
    void testEmptyScoresSafe() {
        CoAttainmentResultDto res = coPoAttainmentService.calculateCoAttainment(new ArrayList<>(), new BigDecimal("60.00"));
        assertEquals(0, res.getAttainmentLevel());
        assertEquals(new BigDecimal("0.00"), res.getPercentageMeetingThreshold());
    }

    @Test
    @DisplayName("F16_B01: Exactly 70.00% students meeting threshold awards Level 3")
    void testBoundary70PercentLevel3() {
        List<StudentQuestionScoreDto> scores = new ArrayList<>();
        for (int i = 0; i < 7; i++) scores.add(StudentQuestionScoreDto.builder().score(new BigDecimal("6")).maxScore(new BigDecimal("10")).build());
        for (int i = 0; i < 3; i++) scores.add(StudentQuestionScoreDto.builder().score(new BigDecimal("3")).maxScore(new BigDecimal("10")).build());

        CoAttainmentResultDto res = coPoAttainmentService.calculateCoAttainment(scores, new BigDecimal("60.00"));
        assertEquals(3, res.getAttainmentLevel());
        assertEquals(new BigDecimal("70.00"), res.getPercentageMeetingThreshold());
    }

    @Test
    @DisplayName("F16_B02: Exactly 69.99% awards Level 2 (boundary just below 70%)")
    void testBoundary6999PercentLevel2() {
        List<StudentQuestionScoreDto> scores = new ArrayList<>();
        for (int i = 0; i < 6999; i++) scores.add(StudentQuestionScoreDto.builder().score(new BigDecimal("6")).maxScore(new BigDecimal("10")).build());
        for (int i = 0; i < 3001; i++) scores.add(StudentQuestionScoreDto.builder().score(new BigDecimal("3")).maxScore(new BigDecimal("10")).build());

        CoAttainmentResultDto res = coPoAttainmentService.calculateCoAttainment(scores, new BigDecimal("60.00"));
        assertEquals(2, res.getAttainmentLevel());
        assertEquals(new BigDecimal("69.99"), res.getPercentageMeetingThreshold());
    }

    @Test
    @DisplayName("F16_DirectPo: Calculates weighted PO direct attainment from CO levels")
    void testPoDirectAttainment() {
        Map<String, Integer> coLevels = Map.of("CO1", 3, "CO2", 2);
        List<CoPoMatrix> mappings = List.of(
                CoPoMatrix.builder().coCode("CO1").poCode("PO1").correlationLevel(3).build(),
                CoPoMatrix.builder().coCode("CO2").poCode("PO1").correlationLevel(2).build()
        );
        // PO1 = (3*3 + 2*2) / (3 + 2) = 13 / 5 = 2.60
        Map<String, BigDecimal> poScores = coPoAttainmentService.calculatePoAttainment(coLevels, mappings);
        assertEquals(new BigDecimal("2.60"), poScores.get("PO1"));
    }
}
