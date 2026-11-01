package com.campusnotify.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.util.UUID;

@Entity
@Table(name = "timetable_slots")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimetableSlot extends BaseEntity {

    @Column(name = "department", nullable = false, length = 50)
    private String department;

    @Column(name = "subject_code", nullable = false, length = 50)
    private String subjectCode;

    @Column(name = "faculty_id", nullable = false)
    private UUID facultyId;

    @Column(name = "room_number", nullable = false, length = 50)
    private String roomNumber;

    @Column(name = "day_of_week", nullable = false, length = 20)
    private String dayOfWeek;

    @Column(name = "start_time", nullable = false, length = 20)
    private String startTime;

    @Column(name = "end_time", nullable = false, length = 20)
    private String endTime;

    @Builder.Default
    @Column(name = "slot_type", nullable = false, length = 50)
    private String slotType = "THEORY"; // THEORY, PRACTICAL, TUTORIAL

    @Column(name = "target_division", length = 20)
    private String targetDivision;

    @Column(name = "target_batch", length = 20)
    private String targetBatch;

    @Column(name = "expected_bssid", length = 100)
    private String expectedBssid;

    @Column(name = "expected_lat")
    private Double expectedLat;

    @Column(name = "expected_lng")
    private Double expectedLng;

    @Builder.Default
    @Column(name = "geofence_radius_meters")
    private Double geofenceRadiusMeters = 50.0;
}
