package com.campusnotify.repository;

import com.campusnotify.entity.HallTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface HallTicketRepository extends JpaRepository<HallTicket, UUID> {
    Optional<HallTicket> findByStudentId(UUID studentId);
    Optional<HallTicket> findByStudentIdAndSemesterAndAcademicYear(UUID studentId, int semester, String academicYear);
}
