package com.campusnotify.repository;

import com.campusnotify.entity.TimetableSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TimetableSlotRepository extends JpaRepository<TimetableSlot, UUID> {
    List<TimetableSlot> findByDepartment(String department);
    List<TimetableSlot> findByFacultyId(UUID facultyId);
    List<TimetableSlot> findBySubjectCode(String subjectCode);
}
