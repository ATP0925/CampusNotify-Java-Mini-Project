package com.campusnotify.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacultyCandidateDto {
    private String id;
    private String name;
    private String dept;
    private List<String> competencies;
    private List<String> busySlotIds;
}
