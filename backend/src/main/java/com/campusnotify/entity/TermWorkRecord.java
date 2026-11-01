package com.campusnotify.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Mumbai University Ordinance 6086 25-Mark Term Work Record.
 * TW (25M) = Attendance (5M) + Lab Experiments (15M) + Viva/Mini-Project (5M).
 */
@Entity
@Table(name = "term_work_records")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TermWorkRecord extends BaseEntity {

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "subject_code", nullable = false, length = 50)
    private String subjectCode;

    @Column(name = "academic_year", nullable = false, length = 20)
    private String academicYear;

    @Builder.Default
    @Column(name = "attendance_marks", nullable = false, precision = 5, scale = 2)
    private BigDecimal attendanceMarks = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "lab_marks", nullable = false, precision = 5, scale = 2)
    private BigDecimal labMarks = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "viva_marks", nullable = false, precision = 5, scale = 2)
    private BigDecimal vivaMarks = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_marks", nullable = false, precision = 5, scale = 2)
    private BigDecimal totalMarks = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "is_defaulter", nullable = false)
    private boolean isDefaulter = false;

    @Builder.Default
    @Column(name = "calculated_at", nullable = false)
    private Instant calculatedAt = Instant.now();
}
