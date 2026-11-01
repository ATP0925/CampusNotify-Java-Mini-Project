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
public class PlacementEligibilityRequestDto {
    private String studentRollNo;
    private BigDecimal currentOfferLpa; // 0 if not placed yet
    private BigDecimal drivePackageLpa; // e.g. 10.5 LPA
    private String driveCompany;
    private int unexcusedDriveAbsences;
    private int activeDeadKts;
}
