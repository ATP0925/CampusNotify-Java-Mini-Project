package com.campusnotify.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * L1: Modern JJWT 0.12.x Token Provider.
 * Generates and validates cryptographically signed JWTs with sub, roles, dept, prn, and jti claims.
 */
@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final SecretKey key;
    private final long accessTokenExpirationMs;
    private final long refreshTokenExpirationMs;
    private final long slidingRenewalThresholdMs;

    public JwtTokenProvider(
            @Value("${campusnotify.security.jwt.secret:campusnotify-super-secret-key-that-is-at-least-256-bits-long-for-hmac-sha256-compliance}") String secret,
            @Value("${campusnotify.security.jwt.access-token-expiration-ms:3600000}") long accessTokenExpirationMs,
            @Value("${campusnotify.security.jwt.refresh-token-expiration-ms:604800000}") long refreshTokenExpirationMs,
            @Value("${campusnotify.security.jwt.sliding-renewal-threshold-ms:900000}") long slidingRenewalThresholdMs) {
        
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
            this.key = Keys.hmacShaKeyFor(padded);
        } else {
            this.key = Keys.hmacShaKeyFor(keyBytes);
        }
        this.accessTokenExpirationMs = accessTokenExpirationMs;
        this.refreshTokenExpirationMs = refreshTokenExpirationMs;
        this.slidingRenewalThresholdMs = slidingRenewalThresholdMs;
    }

    public String generateAccessToken(UUID userId, String username, List<String> roles, String department, String prn) {
        Instant now = Instant.now();
        Instant expiry = now.plusMillis(accessTokenExpirationMs);
        String jti = UUID.randomUUID().toString();

        return Jwts.builder()
                .subject(userId.toString())
                .id(jti)
                .claim("username", username)
                .claim("roles", roles)
                .claim("dept", department)
                .claim("prn", prn)
                .claim("type", "ACCESS")
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(key)
                .compact();
    }

    public String generateRefreshToken(UUID userId) {
        Instant now = Instant.now();
        Instant expiry = now.plusMillis(refreshTokenExpirationMs);
        String jti = UUID.randomUUID().toString();

        return Jwts.builder()
                .subject(userId.toString())
                .id(jti)
                .claim("type", "REFRESH")
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(key)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    public UUID getUserId(String token) {
        Claims claims = parseClaims(token);
        return UUID.fromString(claims.getSubject());
    }

    public String getJti(String token) {
        Claims claims = parseClaims(token);
        return claims.getId();
    }

    public long getRemainingTtlMs(String token) {
        Claims claims = parseClaims(token);
        Date expiration = claims.getExpiration();
        if (expiration == null) {
            return 0;
        }
        return Math.max(0, expiration.getTime() - System.currentTimeMillis());
    }

    public boolean isWithinRenewalThreshold(String token) {
        long remaining = getRemainingTtlMs(token);
        return remaining > 0 && remaining <= slidingRenewalThresholdMs;
    }

    public SecretKey getKey() {
        return key;
    }

    public long getAccessTokenExpirationMs() {
        return accessTokenExpirationMs;
    }
}
