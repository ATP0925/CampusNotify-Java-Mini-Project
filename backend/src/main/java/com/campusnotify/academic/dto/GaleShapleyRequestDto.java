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
public class GaleShapleyRequestDto {
    private List<ProjectGroupDto> groups;
    private List<FacultyGuideDto> guides;
}
