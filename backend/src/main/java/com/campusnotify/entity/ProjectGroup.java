package com.campusnotify.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.util.UUID;

@Entity
@Table(name = "project_groups")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectGroup extends BaseEntity {

    @Column(name = "group_name", nullable = false, length = 100)
    private String groupName;

    @Column(name = "academic_year", nullable = false, length = 20)
    private String academicYear;

    @Column(name = "leader_id", nullable = false)
    private UUID leaderId;

    @Column(name = "member_ids_json", columnDefinition = "TEXT")
    private String memberIdsJson;

    @Column(name = "domain", length = 100)
    private String domain;

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "synopsis", columnDefinition = "TEXT")
    private String synopsis;

    @Column(name = "assigned_guide_id")
    private UUID assignedGuideId;

    @Builder.Default
    @Column(name = "allocation_status", nullable = false, length = 50)
    private String allocationStatus = "SUBMITTED"; // SUBMITTED, MATCHED, FINALIZED
}
