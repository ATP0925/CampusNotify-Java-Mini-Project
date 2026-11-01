package com.campusnotify.repository;

import com.campusnotify.entity.FeedbackSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FeedbackSubmissionRepository extends JpaRepository<FeedbackSubmission, UUID> {
    List<FeedbackSubmission> findByFacultyId(UUID facultyId);
    List<FeedbackSubmission> findBySubjectCode(String subjectCode);
    boolean existsByBlindedTokenHash(String blindedTokenHash);
}
