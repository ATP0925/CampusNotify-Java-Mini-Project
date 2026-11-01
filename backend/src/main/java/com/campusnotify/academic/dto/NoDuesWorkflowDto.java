package com.campusnotify.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoDuesWorkflowDto {
    private String id;
    private String studentId;
    private List<String> nodes;
    private List<List<String>> edges;
    private Map<String, String> nodeStatus;
    private boolean hallTicketIssued;
    private String hallTicketSignature;
}
