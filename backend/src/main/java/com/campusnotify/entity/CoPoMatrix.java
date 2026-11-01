package com.campusnotify.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "co_po_matrices")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoPoMatrix extends BaseEntity {

    @Column(name = "subject_code", nullable = false, length = 50)
    private String subjectCode;

    @Column(name = "co_code", nullable = false, length = 20)
    private String coCode; // CO1 - CO6

    @Column(name = "po_code", nullable = false, length = 20)
    private String poCode; // PO1 - PO12, PSO1, PSO2

    @Column(name = "correlation_level", nullable = false)
    private int correlationLevel; // 1 (Low), 2 (Medium), 3 (High)

    @Column(name = "academic_year", nullable = false, length = 20)
    private String academicYear;
}
