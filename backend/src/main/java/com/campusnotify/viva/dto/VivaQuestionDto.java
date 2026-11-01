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
public class VivaQuestionDto {
    private int questionNo;
    private String category; // SYNTAX_APPROACH, COMPLEXITY_TRADEOFF, EDGE_CASES, REAL_WORLD_APPLICATION
    private String questionText;
    private int suggestedDurationSeconds;
    private List<String> expectedKeywords;
    private String difficulty; // EASY, MEDIUM, HARD
}
