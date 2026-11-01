package com.campusnotify.repository;

import com.campusnotify.entity.ProjectGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectGroupRepository extends JpaRepository<ProjectGroup, UUID> {
    List<ProjectGroup> findByAcademicYear(String academicYear);
    Optional<ProjectGroup> findByGroupName(String groupName);
    List<ProjectGroup> findByAssignedGuideId(UUID assignedGuideId);
}
