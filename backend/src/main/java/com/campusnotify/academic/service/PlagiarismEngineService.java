package com.campusnotify.academic.service;

import com.campusnotify.academic.dto.PlagiarismAnalysisRequestDto;
import com.campusnotify.academic.dto.PlagiarismAnalysisResultDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Feature 41: Anti-Plagiarism AST Fingerprinting & Prompt Injection Defense.
 * Approximates MOSS tokenized winnowing to catch variable-renaming plagiarism across lab batches,
 * and detects adversarial jailbreaks disguised inside code comments.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PlagiarismEngineService {

    private static final List<Pattern> PROMPT_INJECTION_PATTERNS = List.of(
            Pattern.compile("(?i)ignore\\s+previous\\s+instructions"),
            Pattern.compile("(?i)\\[SYSTEM\\s*:\\s*"),
            Pattern.compile("(?i)award\\s+(full|25)\\s+marks"),
            Pattern.compile("(?i)override\\s+(grading|rubric|evaluation)"),
            Pattern.compile("(?i)output\\s*:\\s*\\{\\s*\"score\"\\s*:\\s*25")
    );

    public PlagiarismAnalysisResultDto analyzePlagiarism(PlagiarismAnalysisRequestDto request) {
        log.info("Analyzing code submission {} for roll {}", request.getSubmissionId(), request.getStudentRollNo());

        String rawCode = request.getSourceCode() != null ? request.getSourceCode() : "";

        // 1. Scan for AI Prompt Injection
        boolean injectionDetected = false;
        String detectedPattern = null;
        for (Pattern p : PROMPT_INJECTION_PATTERNS) {
            Matcher m = p.matcher(rawCode);
            if (m.find()) {
                injectionDetected = true;
                detectedPattern = m.group();
                log.warn("Adversarial prompt injection detected in code from student {}: {}", request.getStudentRollNo(), detectedPattern);
                break;
            }
        }

        // 2. Tokenize and normalize code to create AST canonical fingerprint
        Set<String> queryFingerprint = generateWinnowedFingerprint(rawCode);
        String canonicalHash = computeSha256(String.join(",", queryFingerprint));

        // 3. Compare against peer submissions
        double highestSimilarity = 0.0;
        String highestMatchPeer = null;
        String highestMatchSubId = null;
        List<PlagiarismAnalysisResultDto.MatchDetailDto> matches = new ArrayList<>();

        if (request.getPeerSubmissions() != null) {
            for (PlagiarismAnalysisRequestDto.PeerCodeCandidateDto peer : request.getPeerSubmissions()) {
                if (peer.getPeerRollNo() != null && peer.getPeerRollNo().equalsIgnoreCase(request.getStudentRollNo())) {
                    continue; // Skip self
                }

                Set<String> peerFingerprint = generateWinnowedFingerprint(peer.getSourceCode() != null ? peer.getSourceCode() : "");
                double similarity = computeJaccardSimilarity(queryFingerprint, peerFingerprint);

                if (similarity > 0.0) {
                    matches.add(PlagiarismAnalysisResultDto.MatchDetailDto.builder()
                            .peerRollNo(peer.getPeerRollNo())
                            .similarityScore(Math.round(similarity * 1000.0) / 10.0) // percentage
                            .matchingTokensCount(countIntersection(queryFingerprint, peerFingerprint))
                            .build());
                }

                if (similarity > highestSimilarity) {
                    highestSimilarity = similarity;
                    highestMatchPeer = peer.getPeerRollNo();
                    highestMatchSubId = peer.getSubmissionId();
                }
            }
        }

        double finalPercent = Math.round(highestSimilarity * 1000.0) / 10.0;
        boolean crossBatch = finalPercent > 70.0; // Above 70% AST similarity indicates direct copy/collusion

        return PlagiarismAnalysisResultDto.builder()
                .submissionId(request.getSubmissionId())
                .highestSimilarityPercent(finalPercent)
                .highestMatchPeerRollNo(highestMatchPeer)
                .highestMatchSubmissionId(highestMatchSubId)
                .crossBatchCollusion(crossBatch)
                .promptInjectionDetected(injectionDetected)
                .detectedMaliciousPattern(detectedPattern)
                .astNormalizedFingerprint(canonicalHash)
                .matchedSegments(matches)
                .build();
    }

    private Set<String> generateWinnowedFingerprint(String code) {
        // Strip comments
        String cleaned = code.replaceAll("//.*|/\\*.*?\\*/|#.*", " ");
        // Strip string literals
        cleaned = cleaned.replaceAll("\"[^\"]*\"|'[^']*'", " STR ");
        // Strip numbers
        cleaned = cleaned.replaceAll("\\b\\d+\\b", " NUM ");

        // Normalize identifiers: keep reserved keywords, replace others with VAR
        Set<String> keywords = Set.of(
                "if", "else", "for", "while", "do", "return", "class", "public", "private", "protected",
                "static", "void", "int", "float", "double", "boolean", "new", "import", "def", "function",
                "const", "let", "var", "try", "catch", "finally", "throw", "extends", "implements"
        );

        String[] tokens = cleaned.split("[\\s+;,.(){}\\[\\]=><!&|%*\\-/]+");
        List<String> normalizedTokens = new ArrayList<>();
        for (String t : tokens) {
            String lower = t.toLowerCase().trim();
            if (lower.isEmpty()) continue;
            if (keywords.contains(lower)) {
                normalizedTokens.add(lower);
            } else {
                normalizedTokens.add("VAR");
            }
        }

        // Form k-grams of length 5
        int k = 5;
        if (normalizedTokens.size() < k) {
            return new HashSet<>(normalizedTokens);
        }

        List<Integer> hashes = new ArrayList<>();
        for (int i = 0; i <= normalizedTokens.size() - k; i++) {
            StringBuilder gram = new StringBuilder();
            for (int j = 0; j < k; j++) {
                gram.append(normalizedTokens.get(i + j)).append("_");
            }
            hashes.add(gram.toString().hashCode());
        }

        // Winnowing algorithm: window size w = 4
        int w = 4;
        Set<String> fingerprints = new HashSet<>();
        for (int i = 0; i <= hashes.size() - w; i++) {
            int minHash = Integer.MAX_VALUE;
            for (int j = 0; j < w; j++) {
                int h = hashes.get(i + j);
                if (h < minHash) {
                    minHash = h;
                }
            }
            fingerprints.add(Integer.toHexString(minHash));
        }

        return fingerprints;
    }

    private double computeJaccardSimilarity(Set<String> a, Set<String> b) {
        if (a.isEmpty() && b.isEmpty()) return 1.0;
        if (a.isEmpty() || b.isEmpty()) return 0.0;

        int intersection = 0;
        for (String item : a) {
            if (b.contains(item)) {
                intersection++;
            }
        }

        int union = a.size() + b.size() - intersection;
        return union == 0 ? 0.0 : (double) intersection / union;
    }

    private int countIntersection(Set<String> a, Set<String> b) {
        int count = 0;
        for (String item : a) {
            if (b.contains(item)) {
                count++;
            }
        }
        return count;
    }

    private String computeSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                String h = Integer.toHexString(0xff & b);
                if (h.length() == 1) hex.append('0');
                hex.append(h);
            }
            return hex.toString();
        } catch (Exception e) {
            return UUID.randomUUID().toString();
        }
    }
}

