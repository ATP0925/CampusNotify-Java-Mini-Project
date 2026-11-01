package com.campusnotify.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamEligibilityResultDto {
    private String studentRollNo;
    private int targetSemester;
    private boolean eligible;
    private String admissionStatus; // "PROMOTED", "PROVISIONALLY_PROMOTED", "YEAR_DOWN_DROP"
    private String denialReason;
    private int sem1Backlogs;
    private int sem2Backlogs;
    private int totalDeadKts;
    private List<String> blockingSubjects;
}
