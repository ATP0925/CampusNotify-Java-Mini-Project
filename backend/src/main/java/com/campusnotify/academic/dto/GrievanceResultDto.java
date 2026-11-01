package com.campusnotify.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrievanceResultDto {
    private String grievanceTicketId;
    private String studentMaskedRollNo;
    private String currentEscalationLevel; // "LEVEL_1_MENTOR", "LEVEL_2_HOD", "LEVEL_3_PRINCIPAL_OMBUDSMAN"
    private Instant slaDeadline;
    private boolean slaBreached;
    private String status; // "LOGGED", "UNDER_INVESTIGATION", "RESOLVED", "ESCALATED_DUE_TO_SLA"
    private String assignedOfficerRole;
    private String encryptedLockerHash;
}
