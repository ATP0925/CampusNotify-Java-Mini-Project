package com.campusnotify.repository;

import com.campusnotify.entity.TermWorkRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TermWorkRecordRepository extends JpaRepository<TermWorkRecord, UUID> {
    List<TermWorkRecord> findByStudentId(UUID studentId);
    Optional<TermWorkRecord> findByStudentIdAndSubjectCode(UUID studentId, String subjectCode);
}
