package com.campusnotify.entity;

import com.campusnotify.security.Aes256GcmAttributeConverter;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(name = "username", unique = true, nullable = false, length = 100)
    private String username;

    @Column(name = "email", unique = true, nullable = false, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(name = "department", nullable = false, length = 50)
    private String department;

    @Column(name = "prn", unique = true, length = 50)
    private String prn;

    @Column(name = "roll_no", length = 20)
    private String rollNo;

    @Convert(converter = Aes256GcmAttributeConverter.class)
    @Column(name = "phone", length = 255)
    private String phone;

    @Convert(converter = Aes256GcmAttributeConverter.class)
    @Column(name = "parent_phone", length = 255)
    private String parentPhone;

    @Builder.Default
    @Column(name = "parent_phone_verified", nullable = false)
    private boolean parentPhoneVerified = false;

    @Column(name = "hardware_device_id", length = 255)
    private String hardwareDeviceId;

    @Column(name = "hardware_device_attestation", columnDefinition = "TEXT")
    private String hardwareDeviceAttestation;

    @Builder.Default
    @Column(name = "proxy_strike_count", nullable = false)
    private int proxyStrikeCount = 0;

    @Column(name = "mfa_secret", length = 255)
    private String mfaSecret;

    @Builder.Default
    @Column(name = "mfa_enabled", nullable = false)
    private boolean mfaEnabled = false;

    @Builder.Default
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    public void addRole(Role role) {
        if (this.roles == null) {
            this.roles = new HashSet<>();
        }
        this.roles.add(role);
    }

    public boolean hasRole(RoleType roleType) {
        if (this.roles == null) return false;
        return this.roles.stream().anyMatch(r -> r.getName() == roleType);
    }
}
