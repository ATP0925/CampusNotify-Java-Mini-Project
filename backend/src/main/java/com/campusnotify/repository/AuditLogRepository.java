package com.campusnotify.repository;

import com.campusnotify.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    Optional<AuditLog> findTopByOrderByCreatedAtDesc();

    List<AuditLog> findByUserIdOrderByTimestampDesc(UUID userId);

    List<AuditLog> findByEventTypeOrderByTimestampDesc(String eventType);
}
