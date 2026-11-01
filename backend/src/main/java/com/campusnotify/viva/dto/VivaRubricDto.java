package com.campusnotify.viva.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VivaRubricDto {
    private Double techDepth;
    private Double problemSolving;
    private Double codeUnderstanding;
    private Double communication;
}
