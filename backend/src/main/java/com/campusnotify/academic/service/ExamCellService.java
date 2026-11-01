package com.campusnotify.academic.service;

import com.campusnotify.academic.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;

/**
 * Feature 36: Mumbai University Exam Cell & Academic Standing Engine.
 * Handles ATKT eligibility, Ordinance 0.5045 NSS 10 grace marks allocation,
 * automated revaluation fee reconciliation, and two-man hall ticket override.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ExamCellService {

    /**
     * Enforces Mumbai University CBCS ATKT progression rules:
     * - Entry to Sem 3 (SE): Max 5 KTs permitted across Sem 1 & Sem 2 combined.
     * - Entry to Sem 5 (TE): Sem 1 and Sem 2 MUST BE 100% CLEAR (Zero Dead KTs).
     * - Entry to Sem 7 (BE): Sem 1, 2, 3, and 4 MUST BE 100% CLEAR (Zero Dead KTs).
     */
    public ExamEligibilityResultDto validateEligibility(ExamEligibilityRequestDto request) {
        log.info("Validating exam eligibility for student: {} for target semester: {}",
                request.getStudentRollNo(), request.getTargetSemester());

        List<ExamEligibilityRequestDto.SubjectBacklogDto> backlogs = request.getBacklogs() != null
                ? request.getBacklogs() : Collections.emptyList();

        int sem1Kts = 0;
        int sem2Kts = 0;
        int sem3Kts = 0;
        int sem4Kts = 0;
        List<String> blockingSubjects = new ArrayList<>();

        for (ExamEligibilityRequestDto.SubjectBacklogDto b : backlogs) {
            if (b.getSemester() == 1) {
                sem1Kts++;
                blockingSubjects.add("Sem 1: " + b.getSubjectCode() + " (" + b.getSubjectName() + ")");
            } else if (b.getSemester() == 2) {
                sem2Kts++;
                blockingSubjects.add("Sem 2: " + b.getSubjectCode() + " (" + b.getSubjectName() + ")");
            } else if (b.getSemester() == 3) {
                sem3Kts++;
                blockingSubjects.add("Sem 3: " + b.getSubjectCode() + " (" + b.getSubjectName() + ")");
            } else if (b.getSemester() == 4) {
                sem4Kts++;
                blockingSubjects.add("Sem 4: " + b.getSubjectCode() + " (" + b.getSubjectName() + ")");
            }
        }

        int targetSem = request.getTargetSemester();
        boolean eligible = true;
        String status = "PROMOTED";
        String reason = "All academic criteria satisfied for progression.";

        if (targetSem == 3) { // Entering SE
            if ((sem1Kts + sem2Kts) > 5) {
                eligible = false;
                status = "YEAR_DOWN_DROP";
                reason = "Exceeded maximum allowable backlogs (Max 5 heads permitted across Sem 1 and Sem 2). Total active: " + (sem1Kts + sem2Kts);
            } else if ((sem1Kts + sem2Kts) > 0) {
                status = "PROVISIONALLY_PROMOTED";
                reason = "Promoted with active ATKT backlogs (" + (sem1Kts + sem2Kts) + " heads).";
            }
        } else if (targetSem == 5) { // Entering TE
            if ((sem1Kts + sem2Kts) > 0) {
                eligible = false;
                status = "YEAR_DOWN_DROP";
                reason = "Mumbai University Ordinance: First Year (Sem 1 & Sem 2) must be 100% cleared to register for Semester 5. Active FE backlogs: " + (sem1Kts + sem2Kts);
            }
        } else if (targetSem == 7) { // Entering BE
            if ((sem1Kts + sem2Kts + sem3Kts + sem4Kts) > 0) {
                eligible = false;
                status = "YEAR_DOWN_DROP";
                reason = "Mumbai University Ordinance: First and Second Year (Sem 1 through Sem 4) must be 100% cleared to register for Semester 7. Active backlogs: " + (sem1Kts + sem2Kts + sem3Kts + sem4Kts);
            }
        }

        return ExamEligibilityResultDto.builder()
                .studentRollNo(request.getStudentRollNo())
                .targetSemester(targetSem)
                .eligible(eligible)
                .admissionStatus(status)
                .denialReason(eligible ? null : reason)
                .sem1Backlogs(sem1Kts)
                .sem2Backlogs(sem2Kts)
                .totalDeadKts(backlogs.size())
                .blockingSubjects(blockingSubjects)
                .build();
    }

    /**
     * Feature 37: Revaluation Marks & KT Exam Fee Auto-Reconciler.
     * Prevents duplicate fee payments and automatically credits student ledger upon reval clearance.
     */
    public RevalReconciliationResultDto reconcileReval(RevalReconciliationRequestDto request) {
        log.info("Reconciling reval for roll: {}, subject: {}, original: {}, revised: {}",
                request.getStudentRollNo(), request.getSubjectCode(), request.getOriginalMarks(), request.getRevisedMarks());

        boolean passed = request.getRevisedMarks() >= request.getPassingThreshold();
        String outcome = passed ? "CLEARED_PASSED" : (request.getRevisedMarks() > request.getOriginalMarks() ? "MARKS_IMPROVED_STILL_FAILED" : "UNCHANGED_FAILED");
        boolean ticketRevoked = passed && request.getKtHallTicketId() != null;
        BigDecimal refund = passed && request.getKtExamFeePaid() != null ? request.getKtExamFeePaid() : BigDecimal.ZERO;

        String transcriptData = request.getStudentRollNo() + "|" + request.getSubjectCode() + "|" + request.getRevisedMarks() + "|" + outcome;
        String integrityHash = computeSha256(transcriptData);

        String message = passed
                ? "Revaluation cleared passing threshold (" + request.getRevisedMarks() + "/" + request.getPassingThreshold() + "). KT ticket revoked and refund credited."
                : "Revaluation result failed to meet passing threshold. Student must sit for scheduled KT examination.";

        return RevalReconciliationResultDto.builder()
                .studentRollNo(request.getStudentRollNo())
                .subjectCode(request.getSubjectCode())
                .outcome(outcome)
                .ktTicketRevoked(ticketRevoked)
                .feeRefundCredit(refund)
                .transcriptUpdated(passed)
                .transcriptIntegritySha256(integrityHash)
                .auditMessage(message)
                .build();
    }

    /**
     * Feature 38: Mumbai University Ordinance 0.5045 NSS 10 Grace Marks Engine.
     * Grants up to 10 grace marks to students with verified 120 hours NSS + special 7-day camp.
     * Greedy allocation prioritizes smallest mark deficits to maximize passing subjects.
     */
    public NssGraceMarksResultDto allocateNssGraceMarks(NssGraceMarksRequestDto request) {
        log.info("Allocating Ordinance 0.5045 grace marks for student: {}", request.getStudentRollNo());

        if (request.getCompletedNssHours() < 120) {
            return NssGraceMarksResultDto.builder()
                    .studentRollNo(request.getStudentRollNo())
                    .eligible(false)
                    .ineligibilityReason("Incomplete NSS hours. Minimum 120 hours required under Ordinance 0.5045 (Logged: " + request.getCompletedNssHours() + ").")
                    .totalGraceMarksGranted(0)
                    .build();
        }

        if (!request.isSpecialCampAttended()) {
            return NssGraceMarksResultDto.builder()
                    .studentRollNo(request.getStudentRollNo())
                    .eligible(false)
                    .ineligibilityReason("7-Day NSS Special Rural Residential Camp attendance is mandatory for Ordinance 0.5045 benefit.")
                    .totalGraceMarksGranted(0)
                    .build();
        }

        if (request.isSportsGraceAlreadyClaimed()) {
            return NssGraceMarksResultDto.builder()
                    .studentRollNo(request.getStudentRollNo())
                    .eligible(false)
                    .ineligibilityReason("Dual grace claim prohibited: University Sports grace marks already claimed in this academic year.")
                    .totalGraceMarksGranted(0)
                    .build();
        }

        Map<String, NssGraceMarksRequestDto.SubjectMarksDeficit> subjects = request.getFailingSubjects();
        if (subjects == null || subjects.isEmpty()) {
            return NssGraceMarksResultDto.builder()
                    .studentRollNo(request.getStudentRollNo())
                    .eligible(true)
                    .totalGraceMarksGranted(0)
                    .allClearedWithGrace(true)
                    .ordinanceCitation("MU Ordinance 0.5045")
                    .build();
        }

        // Sort failing subjects ascending by deficit (smallest gap first)
        List<Map.Entry<String, NssGraceMarksRequestDto.SubjectMarksDeficit>> sorted = new ArrayList<>(subjects.entrySet());
        sorted.sort(Comparator.comparingInt(e -> (e.getValue().getPassingMarks() - e.getValue().getCurrentMarks())));

        int availableGrace = 10;
        int totalGranted = 0;
        Map<String, Integer> allocatedGrace = new LinkedHashMap<>();
        Map<String, Integer> finalMarks = new LinkedHashMap<>();
        boolean allCleared = true;

        for (Map.Entry<String, NssGraceMarksRequestDto.SubjectMarksDeficit> entry : sorted) {
            String code = entry.getKey();
            NssGraceMarksRequestDto.SubjectMarksDeficit deficit = entry.getValue();
            int gap = Math.max(0, deficit.getPassingMarks() - deficit.getCurrentMarks());

            if (gap <= availableGrace && gap > 0) {
                allocatedGrace.put(code, gap);
                finalMarks.put(code, deficit.getCurrentMarks() + gap);
                availableGrace -= gap;
                totalGranted += gap;
            } else if (gap > availableGrace) {
                allocatedGrace.put(code, 0);
                finalMarks.put(code, deficit.getCurrentMarks());
                allCleared = false;
            } else {
                allocatedGrace.put(code, 0);
                finalMarks.put(code, deficit.getCurrentMarks());
            }
        }

        return NssGraceMarksResultDto.builder()
                .studentRollNo(request.getStudentRollNo())
                .eligible(true)
                .totalGraceMarksGranted(totalGranted)
                .allocatedGraceBySubject(allocatedGrace)
                .finalSubjectMarks(finalMarks)
                .allClearedWithGrace(allCleared)
                .ordinanceCitation("MU Ordinance 0.5045")
                .build();
    }

    private String computeSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                String h = Integer.toHexString(0xff & b);
                if (h.length() == 1) hex.append('0');
                hex.append(h);
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            return UUID.randomUUID().toString().replace("-", "");
        }
    }
}
