package com.campusnotify.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoDuesClearNodeRequestDto {
    private String studentId;
    private String nodeCode;
    private String clearedBy;
    private String transactionRef;
}
