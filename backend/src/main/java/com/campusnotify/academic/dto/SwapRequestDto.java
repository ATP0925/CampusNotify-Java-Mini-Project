package com.campusnotify.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SwapRequestDto {
    private String slotId;
    private String requestingFacultyId;
    private String substituteFacultyId;
    private String reason;
}
