package com.campusnotify.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;

/**
 * L4: Dynamic TOTP QR Service (15-Second Rotating HMAC-SHA256 Engine).
 * Mathematically seals attendance against static screenshot sharing and remote proxy scanning.
 */
@Service
public class DynamicTotpService {

    private static final Logger log = LoggerFactory.getLogger(DynamicTotpService.class);
    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final int DIGITS = 6;
    private static final int MOD_DIVISOR = 1_000_000;

    private final long timeStepSeconds;
    private final int defaultWindowSteps;
    private final SecureRandom secureRandom = new SecureRandom();

    public DynamicTotpService(
            @Value("${campusnotify.security.totp.time-step-seconds:15}") long timeStepSeconds,
            @Value("${campusnotify.security.totp.window-steps:1}") int defaultWindowSteps) {
        this.timeStepSeconds = timeStepSeconds;
        this.defaultWindowSteps = defaultWindowSteps;
    }

    /**
     * Generates a 6-digit TOTP token using HMAC-SHA256 for the given epoch second.
     */
    public String generateTotp(String secret, long epochSeconds) {
        long timeStep = epochSeconds / timeStepSeconds;
        return generateCodeForStep(secret, timeStep);
    }

    /**
     * Generates TOTP token for current system time.
     */
    public String generateCurrentTotp(String secret) {
        return generateTotp(secret, System.currentTimeMillis() / 1000);
    }

    /**
     * Verifies TOTP token against current time with drift window.
     */
    public boolean verifyTotp(String secret, String token) {
        return verifyTotp(secret, token, System.currentTimeMillis() / 1000, defaultWindowSteps);
    }

    /**
     * Verifies TOTP token for given epoch seconds and window steps (+/- window).
     */
    public boolean verifyTotp(String secret, String token, long epochSeconds, int windowSteps) {
        if (secret == null || token == null || token.length() != DIGITS) {
            return false;
        }

        long currentTimeStep = epochSeconds / timeStepSeconds;

        for (int i = -windowSteps; i <= windowSteps; i++) {
            long step = currentTimeStep + i;
            String expected = generateCodeForStep(secret, step);
            if (expected.equals(token)) {
                return true;
            }
        }
        return false;
    }

    private String generateCodeForStep(String secret, long timeStep) {
        try {
            byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
            SecretKeySpec signKey = new SecretKeySpec(keyBytes, HMAC_SHA256);
            Mac mac = Mac.getInstance(HMAC_SHA256);
            mac.init(signKey);

            byte[] timeBytes = ByteBuffer.allocate(8).putLong(timeStep).array();
            byte[] hash = mac.doFinal(timeBytes);

            // RFC 4226 Dynamic Truncation adapted for SHA-256
            int offset = hash[hash.length - 1] & 0x0F;
            int binary = ((hash[offset] & 0x7F) << 24)
                    | ((hash[offset + 1] & 0xFF) << 16)
                    | ((hash[offset + 2] & 0xFF) << 8)
                    | (hash[offset + 3] & 0xFF);

            int otp = binary % MOD_DIVISOR;
            return String.format("%0" + DIGITS + "d", otp);
        } catch (Exception e) {
            log.error("Failed to generate HMAC-SHA256 TOTP for step {}", timeStep, e);
            throw new IllegalStateException("TOTP generation error", e);
        }
    }

    /**
     * Generates a cryptographically strong random secret key.
     */
    public String generateSecret() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /**
     * Constructs a dynamic attendance QR payload containing slot ID, current TOTP, and timestamp.
     */
    public String generateQrPayload(String secret, UUID slotId) {
        long now = System.currentTimeMillis() / 1000;
        String totp = generateTotp(secret, now);
        return String.format("CNOTIFY:%s:%s:%d", slotId, totp, now);
    }

    public long getTimeStepSeconds() {
        return timeStepSeconds;
    }
}
