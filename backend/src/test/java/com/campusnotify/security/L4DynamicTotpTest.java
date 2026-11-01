package com.campusnotify.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class L4DynamicTotpTest {

    private DynamicTotpService totpService;
    private final String secret = "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP";

    @BeforeEach
    void setUp() {
        totpService = new DynamicTotpService(15L, 1);
    }

    @Test
    void testTotpGenerationAndLength() {
        long epochSecond = 1700000000L;
        String token = totpService.generateTotp(secret, epochSecond);

        assertNotNull(token);
        assertEquals(6, token.length(), "TOTP token must be 6 digits");
        assertTrue(token.matches("\\d{6}"), "TOTP token must contain only numeric digits");
    }

    @Test
    void testDeterministicTotpGeneration() {
        long epochSecond = 1700000010L;
        String token1 = totpService.generateTotp(secret, epochSecond);
        String token2 = totpService.generateTotp(secret, epochSecond + 4); // Still in same 15s step

        assertEquals(token1, token2, "Timestamps within same 15s window must generate identical token");

        // Next 15s step
        String token3 = totpService.generateTotp(secret, epochSecond + 16);
        assertNotEquals(token1, token3, "Timestamps in different 15s windows must generate different tokens");
    }

    @Test
    void testTotpVerificationWithinWindow() {
        long now = 1700000030L;
        String currentToken = totpService.generateTotp(secret, now);

        // Current step verification
        assertTrue(totpService.verifyTotp(secret, currentToken, now, 1));

        // Acceptable previous step (within 1 step window = -15s)
        assertTrue(totpService.verifyTotp(secret, currentToken, now + 14, 1));

        // Acceptable next step (+15s)
        assertTrue(totpService.verifyTotp(secret, currentToken, now - 14, 1));

        // Rejected outside window (+60s = 4 steps away)
        assertFalse(totpService.verifyTotp(secret, currentToken, now + 60, 1));
    }

    @Test
    void testQrPayloadConstruction() {
        UUID slotId = UUID.randomUUID();
        String payload = totpService.generateQrPayload(secret, slotId);

        assertNotNull(payload);
        assertTrue(payload.startsWith("CNOTIFY:" + slotId + ":"));
        String[] parts = payload.split(":");
        assertEquals(4, parts.length);
        assertEquals(6, parts[2].length());
    }
}
