package com.campusnotify.academic.controller;

import com.campusnotify.academic.dto.AnonymousFeedbackRequestDto;
import com.campusnotify.academic.dto.BlindTokenSignRequestDto;
import com.campusnotify.academic.service.ChaumianFeedbackService;
import com.campusnotify.academic.service.ChaumianFeedbackService.AnonymousFeedbackRecord;
import com.campusnotify.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigInteger;
import java.util.Map;

@RestController
@RequestMapping("/api/academic/feedback")
@RequiredArgsConstructor
public class AcademicFeedbackController {

    private final ChaumianFeedbackService chaumianFeedbackService;

    @PostMapping("/blind-token")
    public ResponseEntity<ApiResponse<String>> signBlindedToken(@RequestBody BlindTokenSignRequestDto request) {
        BigInteger blinded = new BigInteger(request.getBlindedToken());
        BigInteger signature = chaumianFeedbackService.signBlindedToken(blinded);
        return ResponseEntity.ok(ApiResponse.success(signature.toString()));
    }

    @PostMapping("/blind-submit")
    public ResponseEntity<ApiResponse<AnonymousFeedbackRecord>> submitBlindFeedback(
            @RequestBody AnonymousFeedbackRequestDto request) {
        BigInteger msgHash = new BigInteger(request.getMessageHash());
        BigInteger sig = new BigInteger(request.getSignature());

        AnonymousFeedbackRecord record = chaumianFeedbackService.submitAnonymousFeedback(
                request.getTokenUuid(),
                msgHash,
                sig,
                request.getFacultyId(),
                request.getRating(),
                request.getComment()
        );
        return ResponseEntity.ok(ApiResponse.success(record));
    }

    @GetMapping("/token-status")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkTokenSpent(@RequestParam String tokenUuid) {
        boolean spent = chaumianFeedbackService.isTokenSpent(tokenUuid);
        return ResponseEntity.ok(ApiResponse.success(Map.of("spent", spent)));
    }
}
