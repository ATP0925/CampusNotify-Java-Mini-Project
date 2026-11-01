package com.campusnotify.proctoring.service;

import com.campusnotify.proctoring.dto.TypingDynamicsEvaluationDto;
import org.springframework.stereotype.Service;

/**
 * Monaco Typing Dynamics & Velocity Clamping Engine (Feature 21).
 * Detects DevTools console code injections, paste bursts, and keystroke anomalies.
 * Velocity clamping threshold: deltaChars / deltaMs < 50 chars / 100ms.
 */
@Service
public class TypingDynamicsService {

    public static final int MAX_BURST_CHARS = 50;
    public static final long MIN_BURST_WINDOW_MS = 100;
    public static final double VELOCITY_THRESHOLD = (double) MAX_BURST_CHARS / MIN_BURST_WINDOW_MS; // 0.5 chars/ms

    /**
     * Evaluates keystroke dynamics for rapid injection or pasting.
     *
     * @param deltaChars Count of characters inserted (or removed)
     * @param deltaMs    Elapsed time in milliseconds
     * @return Evaluation result indicating violation status, type, and computed velocity
     */
    public TypingDynamicsEvaluationDto evaluateTypingDynamics(int deltaChars, long deltaMs) {
        int absChars = Math.abs(deltaChars);
        long effectiveMs = deltaMs <= 0 ? 1 : deltaMs;
        double velocity;
        if (absChars == 0 && deltaMs == 0) {
            velocity = 0.0;
        } else {
            velocity = (double) absChars / effectiveMs;
        }

        boolean burstWindow = deltaMs < MIN_BURST_WINDOW_MS && absChars > MAX_BURST_CHARS;
        boolean velocityExcess = absChars > MAX_BURST_CHARS && velocity > VELOCITY_THRESHOLD;

        if (burstWindow || velocityExcess) {
            return TypingDynamicsEvaluationDto.builder()
                    .violation(true)
                    .type("BURST_INJECTION_DETECTED")
                    .velocity(velocity)
                    .build();
        }

        return TypingDynamicsEvaluationDto.builder()
                .violation(false)
                .type("NORMAL_TYPING")
                .velocity(velocity)
                .build();
    }
}
