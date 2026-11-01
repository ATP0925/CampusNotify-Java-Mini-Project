package com.campusnotify.repository;

import com.campusnotify.entity.GuideAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GuideAllocationRepository extends JpaRepository<GuideAllocation, UUID> {
    List<GuideAllocation> findByAcademicYear(String academicYear);
    Optional<GuideAllocation> findByFacultyIdAndAcademicYear(UUID facultyId, String academicYear);
}
