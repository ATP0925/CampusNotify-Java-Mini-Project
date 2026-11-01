package com.campusnotify.academic.service;

import com.campusnotify.academic.dto.GrievanceRequestDto;
import com.campusnotify.academic.dto.GrievanceResultDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

/**
 * Feature 42: AICTE & UGC Student Grievance Redressal Cell (SGRC) Engine.
 * Implements automated 3-tier SLA escalation (Mentor 72h -> HOD 120h -> Ombudsman 168h),
 * whistleblower anonymization, and cryptographic evidence locker hashing.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GrievanceRedressalService {

    public GrievanceResultDto fileGrievance(GrievanceRequestDto request) {
        log.info("Filing new grievance ticket for category: {}, anonymous: {}",
                request.getCategory(), request.isAnonymousWhistleblower());

        String ticketId = "GRV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Instant now = Instant.now();
        Instant deadline = now.plus(Duration.ofHours(72)); // Level 1 SLA: 72 hours

        String maskedRoll = maskRollNumber(request.getStudentRollNo(), request.isAnonymousWhistleblower());
        String lockerHash = computeSha256(request.getEncryptedStatement() != null ? request.getEncryptedStatement() : ticketId);

        return GrievanceResultDto.builder()
                .grievanceTicketId(ticketId)
                .studentMaskedRollNo(maskedRoll)
                .currentEscalationLevel("LEVEL_1_MENTOR")
                .slaDeadline(deadline)
                .slaBreached(false)
                .status("LOGGED")
                .assignedOfficerRole("FACULTY_MENTOR")
                .encryptedLockerHash(lockerHash)
                .build();
    }

    public GrievanceResultDto evaluateSlaEscalation(GrievanceResultDto ticket, Instant currentTime) {
        if (ticket.getSlaDeadline() == null || currentTime.isBefore(ticket.getSlaDeadline())) {
            return ticket; // Within SLA
        }

        log.warn("Grievance ticket {} breached SLA deadline at level {}. Escalating...",
                ticket.getGrievanceTicketId(), ticket.getCurrentEscalationLevel());

        String currentLevel = ticket.getCurrentEscalationLevel();
        String nextLevel;
        String nextRole;
        Instant nextDeadline;

        if ("LEVEL_1_MENTOR".equals(currentLevel)) {
            nextLevel = "LEVEL_2_HOD";
            nextRole = "HEAD_OF_DEPARTMENT";
            nextDeadline = currentTime.plus(Duration.ofHours(120)); // 5 days for HOD
        } else if ("LEVEL_2_HOD".equals(currentLevel)) {
            nextLevel = "LEVEL_3_PRINCIPAL_OMBUDSMAN";
            nextRole = "CAMPUS_OMBUDSMAN";
            nextDeadline = currentTime.plus(Duration.ofHours(168)); // 7 days for Ombudsman
        } else {
            // Already at top level
            return ticket;
        }

        return GrievanceResultDto.builder()
                .grievanceTicketId(ticket.getGrievanceTicketId())
                .studentMaskedRollNo(ticket.getStudentMaskedRollNo())
                .currentEscalationLevel(nextLevel)
                .slaDeadline(nextDeadline)
                .slaBreached(true)
                .status("ESCALATED_DUE_TO_SLA")
                .assignedOfficerRole(nextRole)
                .encryptedLockerHash(ticket.getEncryptedLockerHash())
                .build();
    }

    private String maskRollNumber(String roll, boolean anonymous) {
        if (!anonymous || roll == null || roll.length() < 6) {
            return roll;
        }
        return roll.substring(0, 4) + "******" + roll.substring(roll.length() - 2);
    }

    private String computeSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                String h = Integer.toHexString(0xff & b);
                if (h.length() == 1) hex.append('0');
                hex.append(h);
            }
            return hex.toString();
        } catch (Exception e) {
            return UUID.randomUUID().toString();
        }
    }
}
