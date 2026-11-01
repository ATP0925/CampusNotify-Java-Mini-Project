package com.campusnotify.submission.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParameterizedSpecDto {
    private int arraySizeN;
    private long seedS;
    private String problemStatement;
    private boolean watermarkEmbedded;
    private String embeddedPrn;
    private UUID practicalId;
    private UUID studentId;
}
