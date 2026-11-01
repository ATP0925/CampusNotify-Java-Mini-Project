package com.campusnotify.submission.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkGradeResultDto {
    private String submissionId;
    private double marks;
    private String feedback;
    private String status; // GRADED
}
