package com.campusnotify.repository;

import com.campusnotify.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {
    List<AttendanceRecord> findByStudentId(UUID studentId);
    List<AttendanceRecord> findBySessionId(UUID sessionId);
}
