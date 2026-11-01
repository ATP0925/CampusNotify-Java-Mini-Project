package com.campusnotify.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * L1: Redis-backed JWT JTI Blacklist Service with in-memory fallback.
 * Guarantees immediate revocation of access tokens on logout or security anomalies.
 */
@Service
public class RedisTokenBlacklistService implements TokenBlacklistService {

    private static final Logger log = LoggerFactory.getLogger(RedisTokenBlacklistService.class);
    private static final String BLACKLIST_KEY_PREFIX = "campusnotify:jwt:blacklist:";

    private final StringRedisTemplate redisTemplate;
    // In-memory fallback map storing JTI -> Expiration Timestamp
    private final Map<String, Instant> inMemoryBlacklist = new ConcurrentHashMap<>();

    public RedisTokenBlacklistService(@Autowired(required = false) StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void blacklistToken(String jti, long ttlSeconds) {
        if (jti == null || jti.isBlank()) {
            return;
        }
        long safeTtl = Math.max(ttlSeconds, 1);
        boolean redisSuccess = false;

        if (redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set(BLACKLIST_KEY_PREFIX + jti, "revoked", safeTtl, TimeUnit.SECONDS);
                redisSuccess = true;
                log.info("Blacklisted JWT JTI [{}] in Redis with TTL {}s", jti, safeTtl);
            } catch (Exception e) {
                log.warn("Redis unavailable for blacklisting JTI [{}], falling back to in-memory store: {}", jti, e.getMessage());
            }
        }

        // Store in local in-memory fallback
        inMemoryBlacklist.put(jti, Instant.now().plusSeconds(safeTtl));
        if (!redisSuccess) {
            log.info("Blacklisted JWT JTI [{}] in in-memory fallback with TTL {}s", jti, safeTtl);
        }
    }

    @Override
    public boolean isBlacklisted(String jti) {
        if (jti == null || jti.isBlank()) {
            return false;
        }

        // Check Redis first if available
        if (redisTemplate != null) {
            try {
                Boolean hasKey = redisTemplate.hasKey(BLACKLIST_KEY_PREFIX + jti);
                if (Boolean.TRUE.equals(hasKey)) {
                    return true;
                }
            } catch (Exception e) {
                log.debug("Redis lookup failed for JTI [{}], falling back to in-memory store: {}", jti, e.getMessage());
            }
        }

        // Check in-memory store
        Instant expiry = inMemoryBlacklist.get(jti);
        if (expiry != null) {
            if (Instant.now().isBefore(expiry)) {
                return true;
            } else {
                inMemoryBlacklist.remove(jti); // Expired, prune
            }
        }

        return false;
    }

    public void clearInMemory() {
        inMemoryBlacklist.clear();
    }
}
