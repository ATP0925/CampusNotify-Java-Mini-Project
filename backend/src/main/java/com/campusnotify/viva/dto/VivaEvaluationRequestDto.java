package com.campusnotify.viva.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VivaEvaluationRequestDto {
    private UUID submissionId;
    private UUID studentId;
    private String transcript;
    private VivaRubricDto rubric;
    private String topic;
    private String studentCode;
}
