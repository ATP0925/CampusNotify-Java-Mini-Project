package com.campusnotify.academic.controller;

import com.campusnotify.academic.dto.DagCycleRequestDto;
import com.campusnotify.academic.dto.NoDuesClearNodeRequestDto;
import com.campusnotify.academic.dto.NoDuesWorkflowDto;
import com.campusnotify.academic.service.NoDuesDagEngine;
import com.campusnotify.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/academic/nodues")
@RequiredArgsConstructor
public class AcademicNoDuesController {

    private final NoDuesDagEngine noDuesDagEngine;

    @PostMapping("/initiate")
    public ResponseEntity<ApiResponse<NoDuesWorkflowDto>> initiateWorkflow(@RequestBody Map<String, String> payload) {
        String studentId = payload.get("studentId");
        if (studentId == null || studentId.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("MISSING_STUDENT_ID", "studentId is required"));
        }
        NoDuesWorkflowDto workflow = noDuesDagEngine.initiateNoDues(studentId);
        return ResponseEntity.ok(ApiResponse.success(workflow));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<NoDuesWorkflowDto>> getStatus(@RequestParam String studentId) {
        NoDuesWorkflowDto workflow = noDuesDagEngine.getWorkflow(studentId);
        if (workflow == null) {
            // Auto-initiate if not yet started
            workflow = noDuesDagEngine.initiateNoDues(studentId);
        }
        return ResponseEntity.ok(ApiResponse.success(workflow));
    }

    @PostMapping("/clear-node")
    public ResponseEntity<ApiResponse<NoDuesWorkflowDto>> clearNode(@RequestBody NoDuesClearNodeRequestDto request) {
        NoDuesWorkflowDto workflow = noDuesDagEngine.clearNode(
                request.getStudentId(),
                request.getNodeCode(),
                request.getClearedBy(),
                request.getTransactionRef()
        );
        return ResponseEntity.ok(ApiResponse.success(workflow));
    }

    @PostMapping("/detect-cycle")
    public ResponseEntity<ApiResponse<Boolean>> detectCycle(@RequestBody DagCycleRequestDto request) {
        boolean hasCycle = noDuesDagEngine.detectCycle(request.getNodes(), request.getEdges());
        return ResponseEntity.ok(ApiResponse.success(hasCycle));
    }
}
