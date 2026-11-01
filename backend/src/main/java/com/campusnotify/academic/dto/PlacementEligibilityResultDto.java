package com.campusnotify.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlacementEligibilityResultDto {
    private String studentRollNo;
    private boolean eligible;
    private String statusCategory; // "ELIGIBLE_DREAM", "ELIGIBLE_OPEN", "BLOCKED_ABSENTEE_DISCIPLINE", "BLOCKED_KT_POLICY", "BLOCKED_PACKAGE_THRESHOLD"
    private String reason;
    private BigDecimal currentOfferLpa;
    private BigDecimal drivePackageLpa;
    private int suspensionDaysRemaining;
}
