package com.campusnotify.submission.service;

import com.campusnotify.submission.dto.ParameterizedSpecDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

/**
 * Dynamic Problem Parameterization Engine with Steganographic Watermarking (Feature 20).
 * Generates unique test vectors per student:
 * - Array Size N = (Roll No mod 50) + 50 (Range: [50, 99])
 * - Pseudorandom Seed S = Hash(PRN) mod 10000 (Range: [0, 9999])
 * - Zero-width Unicode micro-watermarking (\u200B, \u200C, \u200D, \uFEFF) embedding PRN
 * into problem statements to defeat basement Xerox shop leak mafia.
 */
@Slf4j
@Service
public class DynamicParameterizationService {

    public static final char ZW_SPACE = '\u200B';        // Bit 0
    public static final char ZW_NON_JOINER = '\u200C';   // Bit 1
    public static final char ZW_JOINER = '\u200D';       // Delimiter / End
    public static final char ZW_NO_BREAK = '\uFEFF';     // Header / Start

    /**
     * Generates parameterized test vectors and problem statement for student.
     */
    public ParameterizedSpecDto generateParameterizedVector(Object rollNo, String prn) {
        return generateParameterizedVector(null, null, rollNo, prn);
    }

    /**
     * Generates parameterized test vectors with practical and student IDs.
     */
    public ParameterizedSpecDto generateParameterizedVector(UUID practicalId, UUID studentId, Object rollNo, String prn) {
        String rollStr = rollNo != null ? String.valueOf(rollNo).replaceAll("\\D+", "") : "0";
        long rollInt = 0L;
        if (!rollStr.isEmpty()) {
            try {
                rollInt = Long.parseLong(rollStr);
            } catch (NumberFormatException e) {
                rollInt = 0L;
            }
        }

        // N = (Roll mod 50) + 50 => Range: [50, 99]
        int arraySizeN = (int) ((rollInt % 50) + 50);

        // S = Hash(PRN) mod 10000 => Range: [0, 9999]
        String prnClean = prn != null ? prn : "PRN_DEFAULT";
        long seedS = computeSeedFromPrn(prnClean);

        // Steganographic watermark embedding PRN
        String watermark = encodeWatermark(prnClean);

        String problemStatement = "Sort dynamic array of size " + arraySizeN +
                " initialized with linear congruential seed " + seedS + "." + watermark;

        boolean watermarkEmbedded = problemStatement.indexOf(ZW_SPACE) != -1;

        return ParameterizedSpecDto.builder()
                .arraySizeN(arraySizeN)
                .seedS(seedS)
                .problemStatement(problemStatement)
                .watermarkEmbedded(watermarkEmbedded)
                .embeddedPrn(prnClean)
                .practicalId(practicalId)
                .studentId(studentId)
                .build();
    }

    /**
     * Computes deterministic integer seed in range [0, 9999] using SHA-256 of PRN.
     */
    public long computeSeedFromPrn(String prn) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(prn.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 4 && i < hashBytes.length; i++) {
                sb.append(String.format("%02x", hashBytes[i]));
            }
            long val = Long.parseLong(sb.toString(), 16);
            return Math.abs(val % 10000);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm unavailable", e);
        }
    }

    /**
     * Steganographically encodes PRN into invisible zero-width Unicode characters:
     * \uFEFF + bits(byte) with \u200B (0) / \u200C (1) + \u200D
     */
    public String encodeWatermark(String prn) {
        String safePrn = (prn != null) ? prn : "PRN_DEFAULT";
        StringBuilder sb = new StringBuilder();
        sb.append(ZW_NO_BREAK);
        // Also ensure \u200B\u200C\u200D sequence is always present
        sb.append(ZW_SPACE).append(ZW_NON_JOINER).append(ZW_JOINER);

        byte[] bytes = safePrn.getBytes(StandardCharsets.UTF_8);
        for (byte b : bytes) {
            for (int i = 7; i >= 0; i--) {
                int bit = (b >> i) & 1;
                sb.append(bit == 0 ? ZW_SPACE : ZW_NON_JOINER);
            }
        }
        sb.append(ZW_JOINER);
        return sb.toString();
    }

    /**
     * Extracts and recovers original PRN from zero-width steganographic watermark.
     */
    public String decodeWatermark(String watermarkedText) {
        if (watermarkedText == null) return "";

        int startIdx = watermarkedText.indexOf(ZW_NO_BREAK);
        if (startIdx == -1) {
            startIdx = watermarkedText.indexOf(ZW_SPACE);
        }
        if (startIdx == -1) return "";

        // Skip leading sequence \uFEFF\u200B\u200C\u200D if present
        int cursor = startIdx;
        if (cursor < watermarkedText.length() && watermarkedText.charAt(cursor) == ZW_NO_BREAK) {
            cursor++;
        }
        if (cursor + 2 < watermarkedText.length() &&
                watermarkedText.charAt(cursor) == ZW_SPACE &&
                watermarkedText.charAt(cursor + 1) == ZW_NON_JOINER &&
                watermarkedText.charAt(cursor + 2) == ZW_JOINER) {
            cursor += 3;
        }

        StringBuilder bits = new StringBuilder();
        for (int i = cursor; i < watermarkedText.length(); i++) {
            char c = watermarkedText.charAt(i);
            if (c == ZW_SPACE) {
                bits.append('0');
            } else if (c == ZW_NON_JOINER) {
                bits.append('1');
            } else if (c == ZW_JOINER) {
                break;
            }
        }

        if (bits.length() % 8 != 0 && bits.length() < 8) {
            return "";
        }

        int byteLen = bits.length() / 8;
        byte[] resultBytes = new byte[byteLen];
        for (int b = 0; b < byteLen; b++) {
            int val = 0;
            for (int bit = 0; bit < 8; bit++) {
                if (bits.charAt(b * 8 + bit) == '1') {
                    val |= (1 << (7 - bit));
                }
            }
            resultBytes[b] = (byte) val;
        }

        return new String(resultBytes, StandardCharsets.UTF_8);
    }

    /**
     * Verifies whether the problem statement contains a watermark matching the expected PRN.
     */
    public boolean verifyWatermark(String problemStatement, String expectedPrn) {
        if (problemStatement == null || expectedPrn == null) return false;
        String decoded = decodeWatermark(problemStatement);
        return expectedPrn.equals(decoded);
    }
}
