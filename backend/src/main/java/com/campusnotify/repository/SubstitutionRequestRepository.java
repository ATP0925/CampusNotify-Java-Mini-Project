package com.campusnotify.repository;

import com.campusnotify.entity.SubstitutionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubstitutionRequestRepository extends JpaRepository<SubstitutionRequest, UUID> {
    List<SubstitutionRequest> findByRequestingFacultyId(UUID requestingFacultyId);
    List<SubstitutionRequest> findBySubstituteFacultyId(UUID substituteFacultyId);
    List<SubstitutionRequest> findByTimetableSlotId(UUID timetableSlotId);
    List<SubstitutionRequest> findByStatus(String status);
}
