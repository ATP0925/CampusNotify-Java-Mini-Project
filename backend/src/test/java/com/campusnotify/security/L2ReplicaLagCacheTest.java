package com.campusnotify.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class L2ReplicaLagCacheTest {

    private ReplicaLagCacheService replicaLagCacheService;
    private final UUID studentId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        replicaLagCacheService = new ReplicaLagCacheService(null, 5L);
        replicaLagCacheService.clearAll();
    }

    @Test
    void testRegisterWriteFenceAndReadYourOwnWrites() {
        String entityKey = "attendance:session:101";
        String stateSnapshot = "{\"status\":\"PRESENT\",\"scannedAt\":1700000000}";

        assertFalse(replicaLagCacheService.hasActiveWriteFence(studentId, entityKey));
        assertNull(replicaLagCacheService.getCachedState(studentId, entityKey));

        String fencingToken = replicaLagCacheService.registerWriteFence(studentId, entityKey, stateSnapshot);

        assertNotNull(fencingToken);
        assertTrue(fencingToken.startsWith("wf_"));
        assertTrue(replicaLagCacheService.hasActiveWriteFence(studentId, entityKey));
        assertEquals(stateSnapshot, replicaLagCacheService.getCachedState(studentId, entityKey));
    }

    @Test
    void testWriteFenceExpiration() throws InterruptedException {
        String entityKey = "grade:practical:1";
        // 1 second TTL
        replicaLagCacheService.registerWriteFence(studentId, entityKey, "MARKS=10", 1L);

        assertTrue(replicaLagCacheService.hasActiveWriteFence(studentId, entityKey));

        // Wait for TTL to expire
        Thread.sleep(1100);

        assertFalse(replicaLagCacheService.hasActiveWriteFence(studentId, entityKey));
        assertNull(replicaLagCacheService.getCachedState(studentId, entityKey));
    }
}
