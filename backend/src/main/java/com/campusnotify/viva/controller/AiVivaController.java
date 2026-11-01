package com.campusnotify.viva.controller;

import com.campusnotify.dto.ApiResponse;
import com.campusnotify.viva.dto.*;
import com.campusnotify.viva.service.AiVivaEvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/viva")
@RequiredArgsConstructor
public class AiVivaController {

    private final AiVivaEvaluationService aiVivaService;

    @PostMapping("/evaluate")
    public ResponseEntity<ApiResponse<VivaEvaluationResultDto>> evaluateViva(
            @RequestBody VivaEvaluationRequestDto request) {
        VivaEvaluationResultDto result = aiVivaService.evaluateTranscript(
                request.getTranscript(),
                request.getRubric()
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/generate-questions")
    public ResponseEntity<ApiResponse<List<VivaQuestionDto>>> generateQuestions(
            @RequestBody VivaGenerateQuestionsRequestDto request) {
        int count = request.getQuestionCount() != null ? request.getQuestionCount() : 4;
        List<VivaQuestionDto> questions = aiVivaService.generateQuestions(
                request.getTopic(),
                request.getSubjectCode(),
                request.getStudentCode(),
                count
        );
        return ResponseEntity.ok(ApiResponse.success(questions));
    }

    @PostMapping("/analyze-transcript")
    public ResponseEntity<ApiResponse<TranscriptAnalysisResultDto>> analyzeTranscript(
            @RequestBody Map<String, String> payload) {
        String transcript = payload.get("transcript");
        TranscriptAnalysisResultDto analysis = aiVivaService.analyzeTranscript(transcript);
        return ResponseEntity.ok(ApiResponse.success(analysis));
    }
}
