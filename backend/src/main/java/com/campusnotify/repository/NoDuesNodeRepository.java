package com.campusnotify.repository;

import com.campusnotify.entity.NoDuesNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NoDuesNodeRepository extends JpaRepository<NoDuesNode, UUID> {
    Optional<NoDuesNode> findByNodeCode(String nodeCode);
}
