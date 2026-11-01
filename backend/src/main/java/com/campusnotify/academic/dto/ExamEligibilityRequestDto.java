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
public class ExamEligibilityRequestDto {
    private String studentRollNo;
    private int targetSemester; // e.g. 5 for TE Sem 5
    private List<SubjectBacklogDto> backlogs;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubjectBacklogDto {
        private String subjectCode;
        private int semester;
        private String subjectName;
        private boolean isInternalKt;
        private boolean isExternalKt;
    }
}

