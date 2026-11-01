package com.campusnotify.viva.service;

import com.campusnotify.viva.dto.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * AI Viva Voce Evaluation Service (Feature 22).
 * Implements 4-axis rubric scoring:
 * - Technical Depth (40%)
 * - Problem Solving (30%)
 * - Code Understanding (20%)
 * - Communication (10%)
 * Scales composite 0-10 score to 0-5 Mumbai University Viva component marks
 * and maps to NBA Attainment Levels (0, 1, 2, 3).
 */
@Slf4j
@Service
public class AiVivaEvaluationService {

    private static final Set<String> COMMON_TECH_KEYWORDS = Set.of(
            "algorithm", "complexity", "time", "space", "b-tree", "hash", "tree", "graph",
            "recursion", "pointer", "memory", "cache", "database", "transaction", "index",
            "acid", "lock", "deadlock", "race", "concurrency", "thread", "asynchronous",
            "crdt", "steganography", "encryption", "aes", "sha256", "rsa", "jwt", "totp",
            "normalization", "join", "query", "sorting", "search", "stack", "queue", "vector"
    );

    private static final Set<String> HESITATION_WORDS = Set.of(
            "um", "uh", "er", "ah", "like", "maybe", "i guess", "probably", "sort of", "kind of"
    );

    /**
     * Evaluates viva transcript and rubric scores.
     */
    public VivaEvaluationResultDto evaluateTranscript(String transcript, VivaRubricDto rubric) {
        double tech = clampScore(rubric != null ? rubric.getTechDepth() : null);
        double ps = clampScore(rubric != null ? rubric.getProblemSolving() : null);
        double comm = clampScore(rubric != null ? rubric.getCommunication() : null);
        double code = clampScore(rubric != null ? rubric.getCodeUnderstanding() : null);

        double rawComposite = (tech * 0.40) + (ps * 0.30) + (code * 0.20) + (comm * 0.10);
        double compositeScore10 = round2(rawComposite);

        // Scaled to 0-5 for Mumbai University Viva component
        double marksViva5 = round2((compositeScore10 / 10.0) * 5.0);

        // NBA Attainment Level Mapping
        int attainmentLevel;
        if (compositeScore10 >= 7.00) {
            attainmentLevel = 3;
        } else if (compositeScore10 >= 6.00) {
            attainmentLevel = 2;
        } else if (compositeScore10 >= 5.00) {
            attainmentLevel = 1;
        } else {
            attainmentLevel = 0;
        }

        TranscriptAnalysisResultDto analysis = analyzeTranscript(transcript != null ? transcript : "");

        String feedback = generateFeedback(compositeScore10, tech, ps, code, comm);

        return VivaEvaluationResultDto.builder()
                .scores(VivaEvaluationResultDto.ScoresDto.builder()
                        .tech(tech)
                        .ps(ps)
                        .comm(comm)
                        .code(code)
                        .build())
                .compositeScore10(compositeScore10)
                .marksViva5(marksViva5)
                .attainmentLevel(attainmentLevel)
                .feedback(feedback)
                .extractedKeywords(analysis.getExtractedKeywords())
                .conceptualConfidence(analysis.getConceptualConfidence())
                .build();
    }

    /**
     * Generates progressive viva questions dynamically for a practical topic.
     */
    public List<VivaQuestionDto> generateQuestions(String topic, String subjectCode, String studentCode, int count) {
        int questionCount = count > 0 ? count : 4;
        String topicClean = (topic != null && !topic.isBlank()) ? topic : "General Computer Science Lab Practical";

        List<VivaQuestionDto> questions = new ArrayList<>();

        // Question 1: Code Explanation (Approach & Architecture)
        questions.add(VivaQuestionDto.builder()
                .questionNo(1)
                .category("SYNTAX_APPROACH")
                .questionText("Explain the foundational architecture and primary algorithmic approach implemented in your solution for " + topicClean + ".")
                .suggestedDurationSeconds(60)
                .expectedKeywords(List.of("approach", "data structure", "initialization", "method"))
                .difficulty("EASY")
                .build());

        // Question 2: Asymptotic Complexity & Resource Allocation
        if (questionCount >= 2) {
            questions.add(VivaQuestionDto.builder()
                    .questionNo(2)
                    .category("COMPLEXITY_TRADEOFF")
                    .questionText("What is the asymptotic time complexity (worst and average case) and auxiliary space consumption of your " + topicClean + " implementation?")
                    .suggestedDurationSeconds(60)
                    .expectedKeywords(List.of("O(N)", "time complexity", "space complexity", "auxiliary"))
                    .difficulty("MEDIUM")
                    .build());
        }

        // Question 3: Boundary Failure Injection & Edge Cases
        if (questionCount >= 3) {
            questions.add(VivaQuestionDto.builder()
                    .questionNo(3)
                    .category("EDGE_CASES")
                    .questionText("How does your implementation handle extreme boundary cases, such as empty inputs, null pointers, or memory allocation exhaustion under heavy concurrency?")
                    .suggestedDurationSeconds(60)
                    .expectedKeywords(List.of("edge case", "null", "exception", "boundary", "overflow"))
                    .difficulty("HARD")
                    .build());
        }

        // Question 4: Real-World Industry & Mumbai University System Integration
        if (questionCount >= 4) {
            questions.add(VivaQuestionDto.builder()
                    .questionNo(4)
                    .category("REAL_WORLD_APPLICATION")
                    .questionText("How would you scale this " + topicClean + " component in an enterprise collegiate system handling 50,000 concurrent students?")
                    .suggestedDurationSeconds(60)
                    .expectedKeywords(List.of("scaling", "caching", "database", "distributed", "throughput"))
                    .difficulty("MEDIUM")
                    .build());
        }

        return questions;
    }

    /**
     * Performs transcript keyword extraction, hesitation analysis, and conceptual confidence rating.
     */
    public TranscriptAnalysisResultDto analyzeTranscript(String transcript) {
        if (transcript == null || transcript.isBlank()) {
            return TranscriptAnalysisResultDto.builder()
                    .transcript("")
                    .extractedKeywords(Collections.emptyList())
                    .wordCount(0)
                    .hesitationCount(0)
                    .conceptualConfidence(0.0)
                    .clarityAssessment("No response recorded.")
                    .build();
        }

        String lower = transcript.toLowerCase();
        String[] words = lower.split("\\s+");
        int wordCount = words.length;

        // Extract technical keywords
        Set<String> foundKeywords = new LinkedHashSet<>();
        for (String kw : COMMON_TECH_KEYWORDS) {
            if (lower.contains(kw)) {
                foundKeywords.add(kw);
            }
        }

        // Count hesitations
        int hesitationCount = 0;
        for (String hw : HESITATION_WORDS) {
            int index = 0;
            while ((index = lower.indexOf(hw, index)) != -1) {
                hesitationCount++;
                index += hw.length();
            }
        }

        // Confidence calculation:
        // Higher keyword density increases confidence, higher hesitation decreases it.
        double keywordFactor = Math.min(1.0, foundKeywords.size() / 5.0);
        double hesitationPenalty = Math.min(0.5, (hesitationCount * 0.05));
        double lengthFactor = Math.min(1.0, wordCount / 50.0);

        double confidence = Math.max(0.0, Math.min(1.0, (keywordFactor * 0.6 + lengthFactor * 0.4) - hesitationPenalty));
        confidence = round2(confidence);

        String assessment;
        if (confidence >= 0.75) {
            assessment = "Articulate and conceptually thorough defense.";
        } else if (confidence >= 0.50) {
            assessment = "Satisfactory conceptual grasp with minor hesitation.";
        } else {
            assessment = "Hesitant defense with limited technical keyword coverage.";
        }

        return TranscriptAnalysisResultDto.builder()
                .transcript(transcript)
                .extractedKeywords(new ArrayList<>(foundKeywords))
                .wordCount(wordCount)
                .hesitationCount(hesitationCount)
                .conceptualConfidence(confidence)
                .clarityAssessment(assessment)
                .build();
    }

    private double clampScore(Double score) {
        if (score == null) return 0.0;
        return Math.min(10.0, Math.max(0.0, score));
    }

    private double round2(double val) {
        return BigDecimal.valueOf(val).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private String generateFeedback(double composite, double tech, double ps, double code, double comm) {
        if (composite >= 9.0) {
            return "Outstanding technical mastery and crystal clear articulation across all dimensions.";
        } else if (composite >= 7.0) {
            return "Proficient implementation and solid understanding. Meets NBA Level 3 direct attainment.";
        } else if (composite >= 5.0) {
            return "Basic conceptual competency demonstrated. Recommend deeper code walkthrough practice.";
        } else {
            return "Deficient technical defense. Student requires revision on core algorithmic primitives.";
        }
    }
}
