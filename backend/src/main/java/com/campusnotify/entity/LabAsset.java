package com.campusnotify.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "lab_assets")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabAsset extends BaseEntity {

    @Column(name = "asset_code", unique = true, nullable = false, length = 50)
    private String assetCode;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "lab_room", nullable = false, length = 50)
    private String labRoom;

    @Column(name = "status", nullable = false, length = 50)
    private String status; // AVAILABLE, IN_USE, MAINTENANCE, RETIRED

    @Column(name = "specifications", columnDefinition = "TEXT")
    private String specifications;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "mac_address", length = 50)
    private String macAddress;
}
