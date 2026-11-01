package com.campusnotify.submission.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RedoResponseDto {
    private String submissionId;
    private boolean redoRequested;
    private String reason;
    private boolean emailDispatched;
    private long dispatchedAt;
}
