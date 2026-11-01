package com.campusnotify.repository;

import com.campusnotify.entity.CoPoMatrix;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CoPoMatrixRepository extends JpaRepository<CoPoMatrix, UUID> {
    List<CoPoMatrix> findBySubjectCode(String subjectCode);
    List<CoPoMatrix> findBySubjectCodeAndAcademicYear(String subjectCode, String academicYear);
}
