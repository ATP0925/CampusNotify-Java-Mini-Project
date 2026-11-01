package com.campusnotify.viva.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VivaGenerateQuestionsRequestDto {
    private String topic;
    private String subjectCode;
    private String studentCode;
    private Integer questionCount; // defaults to 4
}
