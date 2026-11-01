package com.campusnotify.submission;

import com.campusnotify.submission.dto.ParameterizedSpecDto;
import com.campusnotify.submission.service.DynamicParameterizationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DynamicParameterizationServiceTest {

    private DynamicParameterizationService service;

    @BeforeEach
    void setUp() {
        service = new DynamicParameterizationService();
    }

    @Test
    @DisplayName("F20_T01: Computes array size N in range [50, 99] using (Roll mod 50) + 50")
    void testComputesArraySizeNInRange() {
        ParameterizedSpecDto vec = service.generateParameterizedVector(72, "PRN_1001");
        assertEquals(72, vec.getArraySizeN());
        assertTrue(vec.getArraySizeN() >= 50 && vec.getArraySizeN() <= 99);
    }

    @Test
    @DisplayName("F20_T02: Computes pseudorandom seed S in range [0, 9999] using hash of PRN")
    void testComputesPseudorandomSeedS() {
        ParameterizedSpecDto vec = service.generateParameterizedVector(15, "PRN_2026_MUMBAI");
        assertTrue(vec.getSeedS() >= 0 && vec.getSeedS() < 10000);
    }

    @Test
    @DisplayName("F20_T03: Embeds zero-width Unicode steganographic watermark in problem statement")
    void testEmbedsZeroWidthUnicodeSteganographicWatermark() {
        ParameterizedSpecDto vec = service.generateParameterizedVector(40, "PRN_WATERMARK");
        assertTrue(vec.isWatermarkEmbedded());
        assertTrue(vec.getProblemStatement().contains("\u200B"));
    }

    @Test
    @DisplayName("F20_T04: Produces distinct parameter sets for different student roll numbers")
    void testDistinctParametersForDifferentRollNumbers() {
        ParameterizedSpecDto v1 = service.generateParameterizedVector(10, "PRN_A");
        ParameterizedSpecDto v2 = service.generateParameterizedVector(25, "PRN_B");
        assertNotEquals(v1.getArraySizeN(), v2.getArraySizeN());
    }

    @Test
    @DisplayName("F20_T05: Maintains deterministic parameterization for the same student roll number")
    void testDeterministicParameterization() {
        ParameterizedSpecDto v1 = service.generateParameterizedVector(33, "PRN_CONSTANT");
        ParameterizedSpecDto v2 = service.generateParameterizedVector(33, "PRN_CONSTANT");
        assertEquals(v1.getArraySizeN(), v2.getArraySizeN());
        assertEquals(v1.getSeedS(), v2.getSeedS());
    }

    @Test
    @DisplayName("Boundary 20_1: Roll number 0 yields minimum array size N = 50")
    void testRollZeroYieldsMin50() {
        ParameterizedSpecDto v = service.generateParameterizedVector(0, "PRN0");
        assertEquals(50, v.getArraySizeN());
    }

    @Test
    @DisplayName("Boundary 20_2: Roll number 49 yields maximum array size N = 99")
    void testRoll49YieldsMax99() {
        ParameterizedSpecDto v = service.generateParameterizedVector(49, "PRN49");
        assertEquals(99, v.getArraySizeN());
    }

    @Test
    @DisplayName("Boundary 20_3: Roll number 50 wraps around to N = 50")
    void testRoll50WrapsAroundTo50() {
        ParameterizedSpecDto v = service.generateParameterizedVector(50, "PRN50");
        assertEquals(50, v.getArraySizeN());
    }

    @Test
    @DisplayName("Boundary 20_4: Roll number 1,000,000 yields valid N in range [50, 99]")
    void testRollMillionYieldsValidRange() {
        ParameterizedSpecDto v = service.generateParameterizedVector(1000000, "PRN_MILLION");
        assertTrue(v.getArraySizeN() >= 50 && v.getArraySizeN() <= 99);
    }

    @Test
    @DisplayName("Boundary 20_5: PRN string with special symbols hashes to seed in range [0, 9999]")
    void testPrnWithSpecialSymbols() {
        ParameterizedSpecDto v = service.generateParameterizedVector(12, "PRN-!@#$%^&*()_+");
        assertTrue(v.getSeedS() >= 0 && v.getSeedS() < 10000);
    }

    @Test
    @DisplayName("Watermark: Full round-trip steganographic encode and decode recovers exact PRN")
    void testSteganographicEncodeDecodeRoundTrip() {
        String originalPrn = "VU4F2526072_MUMBAI";
        String watermark = service.encodeWatermark(originalPrn);

        assertNotNull(watermark);
        assertTrue(watermark.contains(String.valueOf(DynamicParameterizationService.ZW_SPACE)));
        assertTrue(watermark.contains(String.valueOf(DynamicParameterizationService.ZW_NON_JOINER)));

        String decodedPrn = service.decodeWatermark(watermark);
        assertEquals(originalPrn, decodedPrn);

        String statement = "Implement B-Tree with dynamic order." + watermark;
        assertTrue(service.verifyWatermark(statement, originalPrn));
    }

    @Test
    @DisplayName("Adversarial F20_A01: encodeWatermark(null) does not throw NullPointerException and safely defaults")
    void testEncodeWatermarkNullSafe() {
        assertDoesNotThrow(() -> {
            String watermark = service.encodeWatermark(null);
            assertNotNull(watermark);
            String decoded = service.decodeWatermark(watermark);
            assertEquals("PRN_DEFAULT", decoded);
        });
    }

    @Test
    @DisplayName("Adversarial F20_A02: Rejects cross-submission watermark belonging to another student PRN")
    void testVerifyWatermarkCrossSubmissionRejection() {
        String studentAPrn = "VU4F2526072_STUDENT_A";
        String studentBPrn = "VU4F2526073_STUDENT_B";

        String watermarkA = service.encodeWatermark(studentAPrn);
        String statementA = "Dynamic Programming Knapsack Problem." + watermarkA;

        // Student A verifies correctly
        assertTrue(service.verifyWatermark(statementA, studentAPrn));

        // Student B attempting to submit Student A's watermarked statement MUST be rejected
        assertFalse(service.verifyWatermark(statementA, studentBPrn),
                "Watermark from Student A must NOT be accepted when verified against Student B's PRN");
    }

    @Test
    @DisplayName("Adversarial F20_A03: Rejects tampered zero-width watermark bitstream")
    void testVerifyWatermarkTamperingRejection() {
        String originalPrn = "VU4F2526072_MUMBAI";
        String watermark = service.encodeWatermark(originalPrn);

        // Tamper with middle zero-width characters (replace non-joiner with space)
        String tamperedWatermark = watermark.replace(DynamicParameterizationService.ZW_NON_JOINER, DynamicParameterizationService.ZW_SPACE);
        String tamperedStatement = "Problem statement with tampered watermark." + tamperedWatermark;

        assertFalse(service.verifyWatermark(tamperedStatement, originalPrn),
                "Tampered watermark bitstream must not match original PRN");

        // Null checks
        assertFalse(service.verifyWatermark(null, originalPrn));
        assertFalse(service.verifyWatermark(tamperedStatement, null));
    }
}
