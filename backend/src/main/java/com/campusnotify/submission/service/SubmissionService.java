package com.campusnotify.submission.service;

import com.campusnotify.entity.Practical;
import com.campusnotify.entity.Submission;
import com.campusnotify.repository.PracticalRepository;
import com.campusnotify.repository.SubmissionRepository;
import com.campusnotify.submission.dto.DraftSyncRequestDto;
import com.campusnotify.submission.dto.SubmissionDto;
import com.campusnotify.submission.dto.SubmissionRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final PracticalRepository practicalRepository;

    // In-memory cache for CRDT drafts and revision counters
    private final Map<String, DraftSyncRequestDto> draftCache = new ConcurrentHashMap<>();
    private final Map<UUID, Integer> revisionCounters = new ConcurrentHashMap<>();

    @Transactional
    public SubmissionDto submitPractical(SubmissionRequest request) {
        Practical practical = null;
        if (request.getPracticalId() != null) {
            practical = practicalRepository.findById(request.getPracticalId()).orElse(null);
        }

        boolean isLate = false;
        if (practical != null && practical.getDueDate() != null) {
            isLate = Instant.now().isAfter(practical.getDueDate());
        }

        String content = request.getContent() != null ? request.getContent() : "";
        String hash = computeSha256(content);

        // Check for existing submission for this student + practical
        List<Submission> existing = request.getPracticalId() != null && request.getStudentId() != null ?
                submissionRepository.findByPracticalId(request.getPracticalId()).stream()
                        .filter(s -> request.getStudentId().equals(s.getStudentId()))
                        .toList() : Collections.emptyList();

        Submission submission;
        int revision = 1;

        if (!existing.isEmpty()) {
            submission = existing.get(0);
            int prevRev = revisionCounters.getOrDefault(submission.getId(), 1);
            revision = prevRev + 1;
            revisionCounters.put(submission.getId(), revision);

            submission.setContent(content);
            submission.setSubmissionHash(hash);
            submission.setStatus("SUBMITTED");
            submission.setLate(isLate);
            submission.setSubmittedAt(Instant.now());
        } else {
            submission = Submission.builder()
                    .practicalId(request.getPracticalId())
                    .studentId(request.getStudentId())
                    .content(content)
                    .submissionHash(hash)
                    .status("SUBMITTED")
                    .maxMarks(practical != null ? practical.getMaxMarks() : java.math.BigDecimal.valueOf(10.00))
                    .isLate(isLate)
                    .submittedAt(Instant.now())
                    .build();
        }

        Submission saved = submissionRepository.save(submission);
        revisionCounters.putIfAbsent(saved.getId(), revision);

        log.info("Saved submission [{}] for student [{}] practical [{}] revision [{}]",
                saved.getId(), saved.getStudentId(), saved.getPracticalId(), revision);

        return mapToDto(saved, revision, request.getLanguage(), request.getExecutionStatus(), request.getExitCode());
    }

    @Transactional(readOnly = true)
    public SubmissionDto getSubmission(UUID id) {
        return submissionRepository.findById(id)
                .map(s -> mapToDto(s, revisionCounters.getOrDefault(s.getId(), 1), null, null, null))
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<SubmissionDto> getSubmissionsByStudent(UUID studentId) {
        return submissionRepository.findByStudentId(studentId).stream()
                .map(s -> mapToDto(s, revisionCounters.getOrDefault(s.getId(), 1), null, null, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SubmissionDto> getSubmissionsByPractical(UUID practicalId) {
        return submissionRepository.findByPracticalId(practicalId).stream()
                .map(s -> mapToDto(s, revisionCounters.getOrDefault(s.getId(), 1), null, null, null))
                .collect(Collectors.toList());
    }

    public DraftSyncRequestDto saveDraft(DraftSyncRequestDto draft) {
        String key = draft.getPracticalId() + "_" + draft.getStudentId();
        draftCache.put(key, draft);
        log.debug("Saved CRDT Draft WAL version [{}] for key [{}]", draft.getWalVersion(), key);
        return draft;
    }

    public DraftSyncRequestDto getDraft(UUID practicalId, UUID studentId) {
        return draftCache.get(practicalId + "_" + studentId);
    }

    private SubmissionDto mapToDto(Submission entity, int revision, String language, String execStatus, Integer exitCode) {
        return SubmissionDto.builder()
                .id(entity.getId())
                .practicalId(entity.getPracticalId())
                .studentId(entity.getStudentId())
                .content(entity.getContent())
                .submissionHash(entity.getSubmissionHash())
                .status(entity.getStatus())
                .marks(entity.getMarks())
                .maxMarks(entity.getMaxMarks())
                .aiScore(entity.getAiScore())
                .aiVivaTranscript(entity.getAiVivaTranscript())
                .feedback(entity.getFeedback())
                .isLate(entity.isLate())
                .revision(revision)
                .language(language != null ? language : "java")
                .executionStatus(execStatus != null ? execStatus : "SUCCESS")
                .exitCode(exitCode != null ? exitCode : 0)
                .submittedAt(entity.getSubmittedAt())
                .evaluatedAt(entity.getEvaluatedAt())
                .graderId(entity.getGraderId())
                .build();
    }

    private String computeSha256(String content) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(content.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
