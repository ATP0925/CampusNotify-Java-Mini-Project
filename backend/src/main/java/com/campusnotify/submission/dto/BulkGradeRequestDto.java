package com.campusnotify.submission.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkGradeRequestDto {
    private UUID practicalId;
    private Double defaultMarks;
    private Boolean adoptAiScore;
    private List<BulkGradeItemDto> evaluations;
}
