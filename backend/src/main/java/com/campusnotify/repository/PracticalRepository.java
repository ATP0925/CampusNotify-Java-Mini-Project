package com.campusnotify.repository;

import com.campusnotify.entity.Practical;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PracticalRepository extends JpaRepository<Practical, UUID> {
    List<Practical> findBySubjectCode(String subjectCode);
}
