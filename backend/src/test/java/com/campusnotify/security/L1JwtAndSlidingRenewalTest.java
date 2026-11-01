package com.campusnotify.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class L1JwtAndSlidingRenewalTest {

    private JwtTokenProvider jwtTokenProvider;
    private RedisTokenBlacklistService blacklistService;
    private SlidingTokenRenewalInterceptor renewalInterceptor;

    private final String secret = "campusnotify-test-secret-key-that-is-at-least-256-bits-long-for-hmac-sha256";
    private final UUID testUserId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        // 3600000ms (1 hr) access token, 604800000ms refresh token, 900000ms (15m) renewal threshold
        jwtTokenProvider = new JwtTokenProvider(secret, 3600000L, 604800000L, 900000L);
        blacklistService = new RedisTokenBlacklistService(null);
        blacklistService.clearInMemory();
        renewalInterceptor = new SlidingTokenRenewalInterceptor(jwtTokenProvider);
    }

    @Test
    void testAccessTokenGenerationAndValidation() {
        String token = jwtTokenProvider.generateAccessToken(
                testUserId, "rohit_sharma", List.of("STUDENT"), "IT", "VU4F2526072");

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));

        Claims claims = jwtTokenProvider.parseClaims(token);
        assertEquals(testUserId.toString(), claims.getSubject());
        assertEquals("rohit_sharma", claims.get("username"));
        assertEquals("IT", claims.get("dept"));
        assertEquals("VU4F2526072", claims.get("prn"));
        assertNotNull(claims.getId()); // JTI
    }

    @Test
    void testJtiRevocationAndBlacklist() {
        String token = jwtTokenProvider.generateAccessToken(
                testUserId, "rohit_sharma", List.of("STUDENT"), "IT", "VU4F2526072");
        String jti = jwtTokenProvider.getJti(token);

        assertFalse(blacklistService.isBlacklisted(jti));

        blacklistService.blacklistToken(jti, 3600);
        assertTrue(blacklistService.isBlacklisted(jti));
    }

    @Test
    void testSlidingTokenRenewalThreshold() {
        // Short-lived token provider with 10s validity and 30s threshold (triggers renewal immediately)
        JwtTokenProvider shortLivedProvider = new JwtTokenProvider(secret, 10000L, 60000L, 30000L);
        String token = shortLivedProvider.generateAccessToken(
                testUserId, "rohit_sharma", List.of("STUDENT"), "IT", "VU4F2526072");

        assertTrue(shortLivedProvider.isWithinRenewalThreshold(token));

        SlidingTokenRenewalInterceptor interceptor = new SlidingTokenRenewalInterceptor(shortLivedProvider);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();

        boolean proceed = interceptor.preHandle(request, response, new Object());
        assertTrue(proceed);

        String renewedToken = response.getHeader(SlidingTokenRenewalInterceptor.RENEWED_TOKEN_HEADER);
        assertNotNull(renewedToken, "Renewed token header must be present");
        assertTrue(shortLivedProvider.validateToken(renewedToken));
        assertEquals(testUserId, shortLivedProvider.getUserId(renewedToken));
    }
}
