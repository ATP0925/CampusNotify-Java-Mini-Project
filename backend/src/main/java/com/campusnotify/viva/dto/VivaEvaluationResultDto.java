package com.campusnotify.viva.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VivaEvaluationResultDto {
    private ScoresDto scores;
    private double compositeScore10;
    private double marksViva5;
    private int attainmentLevel;
    private String feedback;
    private List<String> extractedKeywords;
    private double conceptualConfidence;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoresDto {
        private double tech;
        private double ps;
        private double comm;
        private double code;
    }
}
