package com.campusnotify.service;

import com.campusnotify.entity.AuditLog;
import com.campusnotify.repository.AuditLogRepository;
import com.campusnotify.security.AuditHashChainService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * L8: Immutable Audit Logging Service backed by Cryptographic Hash Chaining.
 */
@Service
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);

    private final AuditLogRepository auditLogRepository;
    private final AuditHashChainService auditHashChainService;

    public AuditLogService(AuditLogRepository auditLogRepository, AuditHashChainService auditHashChainService) {
        this.auditLogRepository = auditLogRepository;
        this.auditHashChainService = auditHashChainService;
    }

    @Transactional
    public AuditLog logEvent(UUID userId, String eventType, String details, String ipAddress, String userAgent, String clientBssid) {
        Instant now = Instant.now();

        // Get latest previous hash in the chain
        String previousHash = auditLogRepository.findTopByOrderByCreatedAtDesc()
                .map(AuditLog::getHashChain)
                .orElse(AuditHashChainService.GENESIS_HASH);

        String entityId = userId != null ? userId.toString() : "SYSTEM";
        String payload = (eventType != null ? eventType : "") + "|" + (details != null ? details : "");

        String newHash = auditHashChainService.calculateHash(previousHash, entityId, payload, now.toEpochMilli());

        AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .eventType(eventType)
                .details(details)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .clientBssid(clientBssid)
                .hashChain(newHash)
                .previousHash(previousHash)
                .timestamp(now)
                .build();

        AuditLog saved = auditLogRepository.save(auditLog);
        log.debug("Appended L8 cryptographic audit block [{}] for event [{}]", newHash.substring(0, 16), eventType);
        return saved;
    }

    @Transactional(readOnly = true)
    public AuditHashChainService.ChainVerificationResult verifyIntegrity() {
        List<AuditLog> allLogs = auditLogRepository.findAll();
        // Sort by timestamp or createdAt ascending
        allLogs.sort((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()));

        List<AuditHashChainService.AuditNode> nodes = allLogs.stream()
                .map(l -> new AuditHashChainService.AuditNode(
                        l.getHashChain(),
                        l.getPreviousHash(),
                        l.getUserId() != null ? l.getUserId().toString() : "SYSTEM",
                        (l.getEventType() != null ? l.getEventType() : "") + "|" + (l.getDetails() != null ? l.getDetails() : ""),
                        l.getTimestamp().toEpochMilli()
                ))
                .collect(Collectors.toList());

        return auditHashChainService.verifyChain(nodes);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getUserLogs(UUID userId) {
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId);
    }
}
