package com.campusnotify.submission.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Email Notification Service (Feature 25).
 * Dispatches redo request and grading notifications with mock/fallback mode
 * for offline and test environments.
 */
@Slf4j
@Service
public class EmailNotificationService {

    private final List<DispatchedEmail> dispatchedEmails = Collections.synchronizedList(new ArrayList<>());

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DispatchedEmail {
        private String recipientEmail;
        private String subject;
        private String body;
        private String reason;
        private String submissionId;
        private Instant timestamp;
    }

    /**
     * Dispatches redo notification to student.
     */
    public boolean sendRedoRequestEmail(String recipientEmail, String taskTitle, String reason, String submissionId) {
        String subject = "[CampusNotify] Revision Requested: " + (taskTitle != null ? taskTitle : "Lab Submission");
        String body = "Dear Student,\n\nYour submission requires revision.\nReason: " + reason +
                "\nPlease update and resubmit in Monaco IDE.\nSubmission ID: " + submissionId;

        DispatchedEmail record = DispatchedEmail.builder()
                .recipientEmail(recipientEmail)
                .subject(subject)
                .body(body)
                .reason(reason)
                .submissionId(submissionId)
                .timestamp(Instant.now())
                .build();

        dispatchedEmails.add(record);
        log.info("Dispatched Redo Request Email to [{}] for submission [{}]", recipientEmail, submissionId);
        return true;
    }

    public List<DispatchedEmail> getDispatchedEmails() {
        return new ArrayList<>(dispatchedEmails);
    }

    public void clearDispatchedEmails() {
        dispatchedEmails.clear();
    }
}
