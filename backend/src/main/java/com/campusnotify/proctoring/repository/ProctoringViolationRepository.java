package com.campusnotify.proctoring.repository;

import com.campusnotify.entity.ProctoringViolation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProctoringViolationRepository extends JpaRepository<ProctoringViolation, UUID> {
    List<ProctoringViolation> findBySubmissionIdOrderByTimestampAsc(UUID submissionId);
    List<ProctoringViolation> findByStudentIdOrderByTimestampDesc(UUID studentId);
    long countBySubmissionIdAndViolationType(UUID submissionId, String violationType);
    long countBySubmissionId(UUID submissionId);
}
