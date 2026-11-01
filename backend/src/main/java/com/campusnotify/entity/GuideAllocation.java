package com.campusnotify.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.util.UUID;

@Entity
@Table(name = "guide_allocations")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuideAllocation extends BaseEntity {

    @Column(name = "faculty_id", nullable = false)
    private UUID facultyId;

    @Builder.Default
    @Column(name = "max_capacity", nullable = false)
    private int maxCapacity = 4;

    @Builder.Default
    @Column(name = "current_allocated", nullable = false)
    private int currentAllocated = 0;

    @Column(name = "domain_specialties_json", columnDefinition = "TEXT")
    private String domainSpecialtiesJson;

    @Column(name = "academic_year", nullable = false, length = 20)
    private String academicYear;
}
