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
public class NssGraceMarksRequestDto {
    private String studentRollNo;
    private int completedNssHours; // Must be >= 120
    private boolean specialCampAttended; // Must be true for MU O.5045
    private boolean sportsGraceAlreadyClaimed; // Mutually exclusive per academic year
    private Map<String, SubjectMarksDeficit> failingSubjects; // Subject Code -> details

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubjectMarksDeficit {
        private int currentMarks;
        private int passingMarks;
        private int maxHeadMarks;
    }
}
