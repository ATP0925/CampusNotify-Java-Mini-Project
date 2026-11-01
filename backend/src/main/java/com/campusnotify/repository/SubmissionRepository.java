package com.campusnotify.repository;

import com.campusnotify.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, UUID> {
    List<Submission> findByStudentId(UUID studentId);
    List<Submission> findByPracticalId(UUID practicalId);
    List<Submission> findByAssignmentId(UUID assignmentId);
}
