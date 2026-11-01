package com.campusnotify.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDto {
    private UUID id;
    private String username;
    private String email;
    private String fullName;
    private String department;
    private String prn;
    private String rollNo;
    private String phone;
    private String parentPhone;
    private boolean parentPhoneVerified;
    private String hardwareDeviceId;
    private boolean mfaEnabled;
    private List<String> roles;
}
