package com.campusnotify.viva;

import com.campusnotify.viva.dto.*;
import com.campusnotify.viva.service.AiVivaEvaluationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AiVivaEvaluationServiceTest {

    private AiVivaEvaluationService service;

    @BeforeEach
    void setUp() {
        service = new AiVivaEvaluationService();
    }

    @Test
    @DisplayName("F22_T01: Computes 4-axis rubric composite score and scales to 0-5 viva marks")
    void testRubricCompositeScoreAndMarksScaling() {
        VivaRubricDto rubric = VivaRubricDto.builder()
                .techDepth(8.0)          // 8 * 0.40 = 3.2
                .problemSolving(9.0)     // 9 * 0.30 = 2.7
                .codeUnderstanding(8.0) // 8 * 0.20 = 1.6
                .communication(7.0)      // 7 * 0.10 = 0.7
                .build();                // Sum = 8.20 / 10 => Scaled to 5M: (8.2/10)*5 = 4.10

        VivaEvaluationResultDto res = service.evaluateTranscript("Sample verbal transcript", rubric);

        assertEquals(8.20, res.getCompositeScore10(), 0.001);
        assertEquals(4.10, res.getMarksViva5(), 0.001);
        assertEquals(3, res.getAttainmentLevel());
    }

    @Test
    @DisplayName("F22_T02: Awards full 5.0 marks for perfect 10/10 across all 4 axes")
    void testFullMarksForPerfect10() {
        VivaRubricDto rubric = VivaRubricDto.builder()
                .techDepth(10.0)
                .problemSolving(10.0)
                .codeUnderstanding(10.0)
                .communication(10.0)
                .build();

        VivaEvaluationResultDto res = service.evaluateTranscript("Perfect defense", rubric);

        assertEquals(10.00, res.getCompositeScore10(), 0.001);
        assertEquals(5.00, res.getMarksViva5(), 0.001);
        assertEquals(3, res.getAttainmentLevel());
    }

    @Test
    @DisplayName("F22_T03: Clamps rubric axis input exceeding 10 down to 10")
    void testClampingOverflowScoresAbove10() {
        VivaRubricDto rubric = VivaRubricDto.builder()
                .techDepth(12.0)
                .problemSolving(15.0)
                .codeUnderstanding(10.0)
                .communication(10.0)
                .build();

        VivaEvaluationResultDto res = service.evaluateTranscript("Overflown", rubric);

        assertEquals(10.0, res.getScores().getTech(), 0.001);
        assertEquals(10.0, res.getScores().getPs(), 0.001);
        assertEquals(10.00, res.getCompositeScore10(), 0.001);
        assertEquals(5.00, res.getMarksViva5(), 0.001);
    }

    @Test
    @DisplayName("F22_T04: Maps composite score < 5.0 to NBA Attainment Level 0")
    void testAttainmentLevel0ForCompositeBelow5() {
        VivaRubricDto rubric = VivaRubricDto.builder()
                .techDepth(4.0)
                .problemSolving(4.0)
                .codeUnderstanding(4.0)
                .communication(4.0)
                .build();

        VivaEvaluationResultDto res = service.evaluateTranscript("Weak defense", rubric);

        assertEquals(4.00, res.getCompositeScore10(), 0.001);
        assertEquals(2.00, res.getMarksViva5(), 0.001);
        assertEquals(0, res.getAttainmentLevel());
    }

    @Test
    @DisplayName("F22_T05: Handles missing rubric fields with zero default")
    void testMissingRubricFieldsDefaultToZero() {
        VivaEvaluationResultDto res = service.evaluateTranscript("Partial", null);

        assertEquals(0.00, res.getMarksViva5(), 0.001);
        assertEquals(0.00, res.getCompositeScore10(), 0.001);
        assertEquals(0, res.getAttainmentLevel());
    }

    @Test
    @DisplayName("Boundary 22_1: All rubric axes at 0.0 yields 0.00 marks")
    void testAllRubricAxesZero() {
        VivaRubricDto rubric = VivaRubricDto.builder()
                .techDepth(0.0)
                .problemSolving(0.0)
                .codeUnderstanding(0.0)
                .communication(0.0)
                .build();

        VivaEvaluationResultDto res = service.evaluateTranscript("", rubric);

        assertEquals(0.00, res.getMarksViva5(), 0.001);
        assertEquals(0, res.getAttainmentLevel());
    }

    @Test
    @DisplayName("Boundary 22_2: Composite score 6.99 awards Level 2 (just below Level 3 threshold)")
    void testAttainmentLevel2JustBelow7() {
        VivaRubricDto rubric = VivaRubricDto.builder()
                .techDepth(7.0)
                .problemSolving(7.0)
                .codeUnderstanding(7.0)
                .communication(6.9)
                .build();

        VivaEvaluationResultDto res = service.evaluateTranscript("", rubric);

        assertEquals(2, res.getAttainmentLevel());
        assertEquals(6.99, res.getCompositeScore10(), 0.001);
    }

    @Test
    @DisplayName("Boundary 22_3: Composite score exactly 7.00 awards Level 3")
    void testAttainmentLevel3Exact700() {
        VivaRubricDto rubric = VivaRubricDto.builder()
                .techDepth(7.0)
                .problemSolving(7.0)
                .codeUnderstanding(7.0)
                .communication(7.0)
                .build();

        VivaEvaluationResultDto res = service.evaluateTranscript("", rubric);

        assertEquals(3, res.getAttainmentLevel());
        assertEquals(7.00, res.getCompositeScore10(), 0.001);
    }

    @Test
    @DisplayName("Boundary 22_4: Negative rubric values clamped to 0")
    void testNegativeRubricValuesClampedToZero() {
        VivaRubricDto rubric = VivaRubricDto.builder()
                .techDepth(-5.0)
                .problemSolving(8.0)
                .build();

        VivaEvaluationResultDto res = service.evaluateTranscript("", rubric);

        assertEquals(0.0, res.getScores().getTech(), 0.001);
        assertEquals(8.0, res.getScores().getPs(), 0.001);
    }

    @Test
    @DisplayName("Boundary 22_5: Decimal rubric scores (e.g. 8.75) scale cleanly")
    void testDecimalRubricScoresScaleCleanly() {
        VivaRubricDto rubric = VivaRubricDto.builder()
                .techDepth(8.75)
                .problemSolving(8.75)
                .codeUnderstanding(8.75)
                .communication(8.75)
                .build();

        VivaEvaluationResultDto res = service.evaluateTranscript("", rubric);

        assertEquals(8.75, res.getCompositeScore10(), 0.001);
        assertEquals(4.38, res.getMarksViva5(), 0.001);
    }

    @Test
    @DisplayName("Viva: Dynamic question generator returns 4 progressive categories")
    void testDynamicQuestionGeneration() {
        List<VivaQuestionDto> questions = service.generateQuestions("B-Tree Indexing", "CS302", "code", 4);

        assertEquals(4, questions.size());
        assertEquals(1, questions.get(0).getQuestionNo());
        assertEquals("SYNTAX_APPROACH", questions.get(0).getCategory());
        assertEquals("COMPLEXITY_TRADEOFF", questions.get(1).getCategory());
        assertEquals("EDGE_CASES", questions.get(2).getCategory());
        assertEquals("REAL_WORLD_APPLICATION", questions.get(3).getCategory());
    }

    @Test
    @DisplayName("Viva: Analyzes transcript keywords, hesitation count, and confidence")
    void testTranscriptAnalysis() {
        String transcript = "Um, in our algorithm, we basically used a B-tree index for O(N) search and cache locality, uh, to prevent deadlock.";
        TranscriptAnalysisResultDto analysis = service.analyzeTranscript(transcript);

        assertNotNull(analysis);
        assertTrue(analysis.getWordCount() > 10);
        assertTrue(analysis.getHesitationCount() >= 2);
        assertTrue(analysis.getExtractedKeywords().contains("b-tree") || analysis.getExtractedKeywords().contains("algorithm"));
        assertTrue(analysis.getConceptualConfidence() > 0.0);
    }
}
