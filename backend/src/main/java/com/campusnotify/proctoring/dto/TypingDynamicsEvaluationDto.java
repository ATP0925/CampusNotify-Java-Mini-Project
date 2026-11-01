package com.campusnotify.proctoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TypingDynamicsEvaluationDto {
    private boolean violation;
    private String type; // BURST_INJECTION_DETECTED or NORMAL_TYPING
    private double velocity; // characters per millisecond
}
