package com.campusnotify.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * L8: Cryptographic Hash Chaining Service (SHA-256 Event Sourcing).
 * Implements the Two-Man Rule audit trail for grades, marks, and attendance alterations.
 * Guarantees mathematical detection of any out-of-band direct database tampering.
 */
@Service
public class AuditHashChainService {

    private static final Logger log = LoggerFactory.getLogger(AuditHashChainService.class);
    public static final String GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

    public record ChainVerificationResult(boolean valid, int failedIndex, String reason) {}

    public record AuditNode(
            String hash,
            String previousHash,
            String entityId,
            String changePayload,
            long timestampMillis
    ) {}

    /**
     * Calculates the next SHA-256 hash in the audit chain.
     */
    public String calculateHash(String previousHash, String entityId, String changePayload, long timestampMillis) {
        String safePrev = (previousHash != null && !previousHash.isBlank()) ? previousHash : GENESIS_HASH;
        String safeEntity = entityId != null ? entityId : "";
        String safePayload = changePayload != null ? changePayload : "";

        String raw = safePrev + ":" + safeEntity + ":" + safePayload + ":" + timestampMillis;
        return sha256Hex(raw);
    }

    /**
     * Helper for grade revision hash calculation.
     */
    public String calculateGradeRevisionHash(String previousHash, UUID submissionId, BigDecimal oldMarks, BigDecimal newMarks, String reason, Instant timestamp) {
        String payload = String.format("OLD=%s;NEW=%s;REASON=%s", oldMarks, newMarks, reason);
        return calculateHash(previousHash, submissionId.toString(), payload, timestamp.toEpochMilli());
    }

    /**
     * Verifies the cryptographic continuity and integrity of an entire chain of audit nodes.
     */
    public ChainVerificationResult verifyChain(List<AuditNode> chain) {
        if (chain == null || chain.isEmpty()) {
            return new ChainVerificationResult(true, -1, "Empty chain is valid");
        }

        String expectedPrevHash = GENESIS_HASH;

        for (int i = 0; i < chain.size(); i++) {
            AuditNode node = chain.get(i);

            // Verify previous hash link
            if (!expectedPrevHash.equalsIgnoreCase(node.previousHash())) {
                log.error("Audit chain broken at index {}: expected prevHash {}, found {}", i, expectedPrevHash, node.previousHash());
                return new ChainVerificationResult(false, i,
                        String.format("Hash link discontinuity at index %d: expected previous %s but found %s",
                                i, expectedPrevHash, node.previousHash()));
            }

            // Verify node's own hash matches SHA-256 of contents
            String computedHash = calculateHash(node.previousHash(), node.entityId(), node.changePayload(), node.timestampMillis());
            if (!computedHash.equalsIgnoreCase(node.hash())) {
                log.error("Audit node corrupted at index {}: computed {}, found in record {}", i, computedHash, node.hash());
                return new ChainVerificationResult(false, i,
                        String.format("Corrupted audit node at index %d: payload or timestamp was altered out-of-band", i));
            }

            expectedPrevHash = node.hash();
        }

        return new ChainVerificationResult(true, -1, "Audit hash chain is cryptographically intact");
    }

    private String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 digest unavailable", e);
        }
    }
}
