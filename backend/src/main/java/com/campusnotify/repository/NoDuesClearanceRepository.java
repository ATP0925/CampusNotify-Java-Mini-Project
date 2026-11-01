package com.campusnotify.repository;

import com.campusnotify.entity.NoDuesClearance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NoDuesClearanceRepository extends JpaRepository<NoDuesClearance, UUID> {
    List<NoDuesClearance> findByStudentId(UUID studentId);
    Optional<NoDuesClearance> findByStudentIdAndNodeCode(UUID studentId, String nodeCode);
}
