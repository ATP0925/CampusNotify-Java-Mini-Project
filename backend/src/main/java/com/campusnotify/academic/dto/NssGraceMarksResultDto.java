package com.campusnotify.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NssGraceMarksResultDto {
    private String studentRollNo;
    private boolean eligible;
    private String ineligibilityReason;
    private int totalGraceMarksGranted; // Max 10 under O.5045
    private Map<String, Integer> allocatedGraceBySubject;
    private Map<String, Integer> finalSubjectMarks;
    private boolean allClearedWithGrace;
    private String ordinanceCitation; // "MU Ordinance 0.5045"
}
