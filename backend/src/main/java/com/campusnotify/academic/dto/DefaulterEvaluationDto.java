package com.campusnotify.academic.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
public class DefaulterEvaluationDto {
    private BigDecimal attendancePct;
    private BigDecimal effectivePct;

    @JsonProperty("isDefaulter")
    private boolean isDefaulter;

    private String tier; // D1, D2, D3, or null
    private List<String> actions;
}
