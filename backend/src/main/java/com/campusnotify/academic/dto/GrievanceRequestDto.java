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
public class GrievanceRequestDto {
    private String studentRollNo;
    private String category; // "HARASSMENT_RAGGING", "ACADEMIC_EVALUATION", "INFRASTRUCTURE", "FEES_ACCOUNTS"
    private String title;
    private String encryptedStatement; // Whistleblower protection
    private boolean anonymousWhistleblower;
    private Instant incidentDate;
}

