package com.campusnotify.proctoring;

import com.campusnotify.proctoring.dto.TypingDynamicsEvaluationDto;
import com.campusnotify.proctoring.service.TypingDynamicsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TypingDynamicsServiceTest {

    private TypingDynamicsService service;

    @BeforeEach
    void setUp() {
        service = new TypingDynamicsService();
    }

    @Test
    @DisplayName("F21_T01: Allows normal human typing dynamics (<50 chars per 100ms)")
    void testNormalTypingAllowed() {
        TypingDynamicsEvaluationDto res = service.evaluateTypingDynamics(10, 500);
        assertFalse(res.isViolation());
        assertEquals("NORMAL_TYPING", res.getType());
        assertEquals(0.02, res.getVelocity(), 0.001);
    }

    @Test
    @DisplayName("F21_T02: Flags BURST_INJECTION_DETECTED when >50 chars injected within <100ms")
    void testBurstInjectionDetected() {
        TypingDynamicsEvaluationDto res = service.evaluateTypingDynamics(250, 50);
        assertTrue(res.isViolation());
        assertEquals("BURST_INJECTION_DETECTED", res.getType());
        assertEquals(5.0, res.getVelocity(), 0.001);
    }

    @Test
    @DisplayName("F21_T03: Accepts boundary keystroke: exactly 50 chars in 100ms")
    void testBoundaryExact50Chars100Ms() {
        TypingDynamicsEvaluationDto res = service.evaluateTypingDynamics(50, 100);
        assertFalse(res.isViolation());
        assertEquals("NORMAL_TYPING", res.getType());
    }

    @Test
    @DisplayName("F21_T04: Computes velocity metric accurately (chars per ms)")
    void testVelocityMetricComputation() {
        TypingDynamicsEvaluationDto res = service.evaluateTypingDynamics(100, 200);
        assertEquals(0.5, res.getVelocity(), 0.0001);
    }

    @Test
    @DisplayName("F21_T05: Flags high-frequency injection even when deltaMs is zero")
    void testHighFrequencyZeroMsWithChars() {
        TypingDynamicsEvaluationDto res = service.evaluateTypingDynamics(80, 0);
        assertTrue(res.isViolation());
        assertEquals("BURST_INJECTION_DETECTED", res.getType());
    }

    @Test
    @DisplayName("Boundary 21_1: Exactly 51 chars in 99ms triggers BURST_INJECTION_DETECTED")
    void testBoundary51Chars99Ms() {
        TypingDynamicsEvaluationDto res = service.evaluateTypingDynamics(51, 99);
        assertTrue(res.isViolation());
        assertEquals("BURST_INJECTION_DETECTED", res.getType());
    }

    @Test
    @DisplayName("Boundary 21_3: 0 chars typed in 0ms produces 0 velocity without error")
    void testZeroCharsZeroMs() {
        TypingDynamicsEvaluationDto res = service.evaluateTypingDynamics(0, 0);
        assertFalse(res.isViolation());
        assertEquals(0.0, res.getVelocity(), 0.0001);
    }

    @Test
    @DisplayName("Boundary 21_4: Massive paste of 50,000 chars in 10ms triggers violation")
    void testMassivePaste50000Chars10Ms() {
        TypingDynamicsEvaluationDto res = service.evaluateTypingDynamics(50000, 10);
        assertTrue(res.isViolation());
        assertEquals("BURST_INJECTION_DETECTED", res.getType());
    }

    @Test
    @DisplayName("Boundary 21_5: Slow typing of 10 chars in 10,000ms allowed with low velocity")
    void testSlowTypingLowVelocity() {
        TypingDynamicsEvaluationDto res = service.evaluateTypingDynamics(10, 10000);
        assertFalse(res.isViolation());
        assertTrue(res.getVelocity() < 0.01);
    }

    @Test
    @DisplayName("Adversarial F21_A01: Flags sustained injection across extended window (500 chars in 200ms)")
    void testSustainedMultiWindowInjection() {
        // Even though deltaMs (200ms) >= 100ms, velocity is 2.5 chars/ms > 0.5 chars/ms and chars > 50
        TypingDynamicsEvaluationDto res = service.evaluateTypingDynamics(500, 200);
        assertTrue(res.isViolation());
        assertEquals("BURST_INJECTION_DETECTED", res.getType());
        assertEquals(2.5, res.getVelocity(), 0.001);
    }

    @Test
    @DisplayName("Adversarial F21_A02: Safely handles negative deltaChars (rapid delete) using Math.abs")
    void testNegativeDeltaCharsHandling() {
        // Negative delta chars (-300) in 100ms
        TypingDynamicsEvaluationDto res = service.evaluateTypingDynamics(-300, 100);
        assertTrue(res.isViolation());
        assertEquals("BURST_INJECTION_DETECTED", res.getType());
        assertEquals(3.0, res.getVelocity(), 0.001);
    }
}
