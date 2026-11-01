package com.campusnotify.proctoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TypingDynamicsRequestDto {
    private int deltaChars;
    private long deltaMs;
}
