package com.campusnotify.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class L8AuditHashChainTest {

    private AuditHashChainService hashChainService;

    @BeforeEach
    void setUp() {
        hashChainService = new AuditHashChainService();
    }

    @Test
    void testGenesisBlockAndChainProgression() {
        long t1 = 1700000000000L;
        String h1 = hashChainService.calculateHash(
                AuditHashChainService.GENESIS_HASH, "USER-1", "LOGIN_SUCCESS", t1);

        assertNotNull(h1);
        assertEquals(64, h1.length(), "SHA-256 hex string must be 64 characters");

        long t2 = 1700000010000L;
        String h2 = hashChainService.calculateHash(h1, "USER-1", "ATTENDANCE_SCAN", t2);
        assertNotNull(h2);
        assertNotEquals(h1, h2);

        List<AuditHashChainService.AuditNode> chain = List.of(
                new AuditHashChainService.AuditNode(h1, AuditHashChainService.GENESIS_HASH, "USER-1", "LOGIN_SUCCESS", t1),
                new AuditHashChainService.AuditNode(h2, h1, "USER-1", "ATTENDANCE_SCAN", t2)
        );

        var verifyResult = hashChainService.verifyChain(chain);
        assertTrue(verifyResult.valid(), "Intact chain must pass verification");
    }

    @Test
    void testTamperDetectionDiscontinuity() {
        long t1 = 1700000000000L;
        String h1 = hashChainService.calculateHash(AuditHashChainService.GENESIS_HASH, "SUB-101", "MARKS=14", t1);

        long t2 = 1700000010000L;
        String h2 = hashChainService.calculateHash(h1, "SUB-101", "MARKS=18", t2);

        long t3 = 1700000020000L;
        String h3 = hashChainService.calculateHash(h2, "SUB-101", "MARKS=22", t3);

        List<AuditHashChainService.AuditNode> tamperedChain = new ArrayList<>(List.of(
                new AuditHashChainService.AuditNode(h1, AuditHashChainService.GENESIS_HASH, "SUB-101", "MARKS=14", t1),
                // Attack: Malicious clerk changed payload from MARKS=18 to MARKS=25 without updating hash
                new AuditHashChainService.AuditNode(h2, h1, "SUB-101", "MARKS=25", t2),
                new AuditHashChainService.AuditNode(h3, h2, "SUB-101", "MARKS=22", t3)
        ));

        var verifyResult = hashChainService.verifyChain(tamperedChain);
        assertFalse(verifyResult.valid(), "Tampered payload must trigger integrity violation");
        assertEquals(1, verifyResult.failedIndex(), "Failure must accurately pinpoint tampered block index");
    }

    @Test
    void testGradeRevisionChaining() {
        UUID submissionId = UUID.randomUUID();
        Instant now = Instant.now();

        String revisionHash = hashChainService.calculateGradeRevisionHash(
                AuditHashChainService.GENESIS_HASH,
                submissionId,
                BigDecimal.valueOf(14.0),
                BigDecimal.valueOf(18.5),
                "Re-evaluated after external viva defense",
                now
        );

        assertNotNull(revisionHash);
        assertEquals(64, revisionHash.length());
    }
}
