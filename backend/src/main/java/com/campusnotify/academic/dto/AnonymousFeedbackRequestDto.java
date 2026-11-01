package com.campusnotify.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnonymousFeedbackRequestDto {
    private String tokenUuid;
    private String messageHash;
    private String signature;
    private UUID facultyId;
    private String subjectCode;
    private int rating; // 1-5
    private String comment;
}
