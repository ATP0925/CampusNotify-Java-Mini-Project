package com.campusnotify.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectGroupDto {
    private String id;
    private List<String> preferences;
    private BigDecimal cgpa;
    private BigDecimal rigor;
    private BigDecimal domainMatch;
}
