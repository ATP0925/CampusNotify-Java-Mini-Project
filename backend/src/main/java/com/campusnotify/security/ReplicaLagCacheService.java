package com.campusnotify.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * L2: Replica Lag Cache Service (Read-Your-Own-Writes Consistency & Write-Fencing Tokens).
 * Masks database replication lag by temporarily serving recently written snapshots
 * and write-fencing tokens from low-latency Redis cache (or in-memory fallback).
 */
@Service
public class ReplicaLagCacheService {

    private static final Logger log = LoggerFactory.getLogger(ReplicaLagCacheService.class);
    private static final String FENCE_PREFIX = "campusnotify:fence:";
    private static final String STATE_PREFIX = "campusnotify:state:";

    private final StringRedisTemplate redisTemplate;
    private final long defaultTtlSeconds;

    // In-memory fallback caches
    private final Map<String, CacheEntry> inMemoryFenceCache = new ConcurrentHashMap<>();
    private final Map<String, CacheEntry> inMemoryStateCache = new ConcurrentHashMap<>();

    private record CacheEntry(String value, Instant expiresAt) {
        boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
    }

    public ReplicaLagCacheService(
            @Autowired(required = false) StringRedisTemplate redisTemplate,
            @Value("${campusnotify.security.replica-lag.ttl-seconds:5}") long defaultTtlSeconds) {
        this.redisTemplate = redisTemplate;
        this.defaultTtlSeconds = defaultTtlSeconds;
    }

    /**
     * Registers a write-fencing token and state snapshot for a given entity key.
     */
    public String registerWriteFence(UUID userId, String entityKey, String stateSnapshot) {
        return registerWriteFence(userId, entityKey, stateSnapshot, defaultTtlSeconds);
    }

    public String registerWriteFence(UUID userId, String entityKey, String stateSnapshot, long ttlSeconds) {
        String fencingToken = "wf_" + UUID.randomUUID().toString().replace("-", "");
        String cacheKey = userId.toString() + ":" + entityKey;
        long safeTtl = Math.max(ttlSeconds, 1);

        // Update Redis if available
        if (redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set(FENCE_PREFIX + cacheKey, fencingToken, safeTtl, TimeUnit.SECONDS);
                if (stateSnapshot != null) {
                    redisTemplate.opsForValue().set(STATE_PREFIX + cacheKey, stateSnapshot, safeTtl, TimeUnit.SECONDS);
                }
                log.debug("Registered write fence in Redis for [{}] token [{}] TTL {}s", cacheKey, fencingToken, safeTtl);
            } catch (Exception e) {
                log.warn("Redis write failed for fence [{}], using in-memory store: {}", cacheKey, e.getMessage());
            }
        }

        // Update in-memory fallback
        Instant expiresAt = Instant.now().plusSeconds(safeTtl);
        inMemoryFenceCache.put(cacheKey, new CacheEntry(fencingToken, expiresAt));
        if (stateSnapshot != null) {
            inMemoryStateCache.put(cacheKey, new CacheEntry(stateSnapshot, expiresAt));
        }

        return fencingToken;
    }

    /**
     * Checks if a user has an active write-fence token indicating potential replication lag.
     */
    public boolean hasActiveWriteFence(UUID userId, String entityKey) {
        String cacheKey = userId.toString() + ":" + entityKey;

        if (redisTemplate != null) {
            try {
                Boolean hasKey = redisTemplate.hasKey(FENCE_PREFIX + cacheKey);
                if (Boolean.TRUE.equals(hasKey)) {
                    return true;
                }
            } catch (Exception e) {
                log.debug("Redis lookup error for fence [{}]: {}", cacheKey, e.getMessage());
            }
        }

        CacheEntry entry = inMemoryFenceCache.get(cacheKey);
        if (entry != null) {
            if (!entry.isExpired()) {
                return true;
            } else {
                inMemoryFenceCache.remove(cacheKey);
            }
        }

        return false;
    }

    /**
     * Retrieves the sticky cached state to satisfy Read-Your-Own-Writes consistency.
     */
    public String getCachedState(UUID userId, String entityKey) {
        String cacheKey = userId.toString() + ":" + entityKey;

        if (redisTemplate != null) {
            try {
                String val = redisTemplate.opsForValue().get(STATE_PREFIX + cacheKey);
                if (val != null) {
                    return val;
                }
            } catch (Exception e) {
                log.debug("Redis state lookup error for [{}]: {}", cacheKey, e.getMessage());
            }
        }

        CacheEntry entry = inMemoryStateCache.get(cacheKey);
        if (entry != null) {
            if (!entry.isExpired()) {
                return entry.value();
            } else {
                inMemoryStateCache.remove(cacheKey);
            }
        }

        return null;
    }

    public void clearAll() {
        inMemoryFenceCache.clear();
        inMemoryStateCache.clear();
    }
}
