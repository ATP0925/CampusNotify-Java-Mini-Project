package com.campusnotify.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "attendance_records")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecord extends BaseEntity {

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Builder.Default
    @Column(name = "status", nullable = false, length = 50)
    private String status = "PRESENT"; // PRESENT, ABSENT, DUTY_LEAVE, MEDICAL_LEAVE, GRACE_BONUS

    @Column(name = "scan_timestamp")
    private Instant scanTimestamp;

    @Column(name = "client_lat")
    private Double clientLat;

    @Column(name = "client_lng")
    private Double clientLng;

    @Column(name = "client_bssid", length = 100)
    private String clientBssid;

    @Column(name = "device_uuid", length = 255)
    private String deviceUuid;

    @Column(name = "nonce_proof", length = 255)
    private String nonceProof;

    @Builder.Default
    @Column(name = "verification_mode", nullable = false, length = 50)
    private String verificationMode = "QR_TOTP"; // QR_TOTP, MANUAL_OVERRIDE, DUTY_PREAPPROVED

    @Column(name = "hash_chain", length = 128)
    private String hashChain;
}
