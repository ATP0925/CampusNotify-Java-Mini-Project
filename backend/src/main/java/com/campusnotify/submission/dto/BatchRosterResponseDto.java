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
public class BatchRosterResponseDto {
    private UUID practicalId;
    private String batchName;
    private int totalEnrolled;
    private int submittedCount;
    private int missingCount;
    private List<BatchRosterItemDto> roster;
}
