package com.campusnotify.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "no_dues_nodes")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoDuesNode extends BaseEntity {

    @Column(name = "node_code", unique = true, nullable = false, length = 50)
    private String nodeCode; // LIBRARY, LAB_103, ACCOUNTS, EXAM_CELL, TP_CELL, SPORTS, HOD, PRINCIPAL

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "department", length = 50)
    private String department;

    @Column(name = "sequence_order", nullable = false)
    private int sequenceOrder;

    @Builder.Default
    @Column(name = "is_mandatory", nullable = false)
    private boolean isMandatory = true;
}
