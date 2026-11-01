package com.campusnotify.academic.service;

import com.campusnotify.academic.dto.PlacementEligibilityRequestDto;
import com.campusnotify.academic.dto.PlacementEligibilityResultDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Feature 40: Training & Placement Cell (TPO) Enterprise Rule Engine.
 * Enforces Dream/Non-Dream package multipliers, disciplinary no-show blacklisting,
 * and zero-dead-KT campus drive compliance.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PlacementService {

    private static final BigDecimal DREAM_THRESHOLD_LPA = new BigDecimal("8.50");
    private static final BigDecimal PACKAGE_MULTIPLIER_UPGRADE = new BigDecimal("1.50");

    public PlacementEligibilityResultDto evaluateDriveEligibility(PlacementEligibilityRequestDto request) {
        log.info("Evaluating TPO drive eligibility for roll: {}, currentOffer: {} LPA, drive: {} ({} LPA)",
                request.getStudentRollNo(), request.getCurrentOfferLpa(), request.getDriveCompany(), request.getDrivePackageLpa());

        // 1. Check Dead KT policy (TPO mandatory zero active backlog rule)
        if (request.getActiveDeadKts() > 0) {
            return PlacementEligibilityResultDto.builder()
                    .studentRollNo(request.getStudentRollNo())
                    .eligible(false)
                    .statusCategory("BLOCKED_KT_POLICY")
                    .reason("Ineligible for campus drives: Student has " + request.getActiveDeadKts() + " active backlogs. Zero dead-KT policy enforced.")
                    .currentOfferLpa(request.getCurrentOfferLpa())
                    .drivePackageLpa(request.getDrivePackageLpa())
                    .suspensionDaysRemaining(0)
                    .build();
        }

        // 2. Check disciplinary no-show blacklisting
        if (request.getUnexcusedDriveAbsences() >= 2) {
            return PlacementEligibilityResultDto.builder()
                    .studentRollNo(request.getStudentRollNo())
                    .eligible(false)
                    .statusCategory("BLOCKED_ABSENTEE_DISCIPLINE")
                    .reason("Debarred from campus placements: Accrued 2 or more unexcused interview/test absences.")
                    .currentOfferLpa(request.getCurrentOfferLpa())
                    .drivePackageLpa(request.getDrivePackageLpa())
                    .suspensionDaysRemaining(365)
                    .build();
        } else if (request.getUnexcusedDriveAbsences() == 1) {
            return PlacementEligibilityResultDto.builder()
                    .studentRollNo(request.getStudentRollNo())
                    .eligible(false)
                    .statusCategory("BLOCKED_ABSENTEE_DISCIPLINE")
                    .reason("Temporarily suspended: 1 unexcused drive absence incurred. 15-day cooldown in effect.")
                    .currentOfferLpa(request.getCurrentOfferLpa())
                    .drivePackageLpa(request.getDrivePackageLpa())
                    .suspensionDaysRemaining(15)
                    .build();
        }

        // 3. Check Dream / Non-Dream Offer multiplier
        BigDecimal current = request.getCurrentOfferLpa() != null ? request.getCurrentOfferLpa() : BigDecimal.ZERO;
        BigDecimal drive = request.getDrivePackageLpa() != null ? request.getDrivePackageLpa() : BigDecimal.ZERO;

        if (current.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal minRequired = current.multiply(PACKAGE_MULTIPLIER_UPGRADE);
            boolean isDream = drive.compareTo(DREAM_THRESHOLD_LPA) >= 0;
            boolean meetsMultiplier = drive.compareTo(minRequired) >= 0;

            if (!isDream && !meetsMultiplier) {
                return PlacementEligibilityResultDto.builder()
                        .studentRollNo(request.getStudentRollNo())
                        .eligible(false)
                        .statusCategory("BLOCKED_PACKAGE_THRESHOLD")
                        .reason("Already placed at " + current + " LPA. Drive package of " + drive + " LPA does not meet the 1.5x minimum upgrade (" + minRequired + " LPA) or Dream tier (8.5 LPA).")
                        .currentOfferLpa(current)
                        .drivePackageLpa(drive)
                        .suspensionDaysRemaining(0)
                        .build();
            }

            return PlacementEligibilityResultDto.builder()
                    .studentRollNo(request.getStudentRollNo())
                    .eligible(true)
                    .statusCategory("ELIGIBLE_DREAM")
                    .reason("Approved under Dream / Super-Dream Offer policy.")
                    .currentOfferLpa(current)
                    .drivePackageLpa(drive)
                    .suspensionDaysRemaining(0)
                    .build();
        }

        // Open candidate (not yet placed)
        return PlacementEligibilityResultDto.builder()
                .studentRollNo(request.getStudentRollNo())
                .eligible(true)
                .statusCategory("ELIGIBLE_OPEN")
                .reason("Open candidate eligible for all campus recruitment drives.")
                .currentOfferLpa(BigDecimal.ZERO)
                .drivePackageLpa(drive)
                .suspensionDaysRemaining(0)
                .build();
    }
}

