package com.campusnotify.submission;

import com.campusnotify.entity.Practical;
import com.campusnotify.entity.Submission;
import com.campusnotify.repository.PracticalRepository;
import com.campusnotify.repository.SubmissionRepository;
import com.campusnotify.submission.dto.DraftSyncRequestDto;
import com.campusnotify.submission.dto.SubmissionDto;
import com.campusnotify.submission.dto.SubmissionRequest;
import com.campusnotify.submission.service.SubmissionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SubmissionServiceTest {

    @Mock
    private SubmissionRepository submissionRepository;

    @Mock
    private PracticalRepository practicalRepository;

    private SubmissionService submissionService;

    @BeforeEach
    void setUp() {
        submissionService = new SubmissionService(submissionRepository, practicalRepository);
    }

    @Test
    @DisplayName("F23_T02: Records submission timestamp and initial status as SUBMITTED")
    void testRecordSubmissionTimestampAndInitialStatus() {
        UUID practicalId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        Practical practical = Practical.builder()
                .title("Exp 2")
                .subjectCode("OS")
                .maxMarks(BigDecimal.valueOf(10.00))
                .build();
        practical.setId(practicalId);

        when(practicalRepository.findById(practicalId)).thenReturn(Optional.of(practical));
        when(submissionRepository.findByPracticalId(practicalId)).thenReturn(Collections.emptyList());

        Submission saved = Submission.builder()
                .practicalId(practicalId)
                .studentId(studentId)
                .content("public class Main {}")
                .status("SUBMITTED")
                .maxMarks(BigDecimal.valueOf(10.00))
                .submittedAt(Instant.now())
                .build();
        saved.setId(UUID.randomUUID());

        when(submissionRepository.save(any(Submission.class))).thenReturn(saved);

        SubmissionRequest req = SubmissionRequest.builder()
                .practicalId(practicalId)
                .studentId(studentId)
                .content("public class Main {}")
                .language("java")
                .executionStatus("SUCCESS")
                .exitCode(0)
                .build();

        SubmissionDto dto = submissionService.submitPractical(req);

        assertNotNull(dto);
        assertEquals("SUBMITTED", dto.getStatus());
        assertNotNull(dto.getSubmittedAt());
        assertEquals("java", dto.getLanguage());
        assertEquals(0, dto.getExitCode());
    }

    @Test
    @DisplayName("F23_T04: Tracks submission revision count on resubmission")
    void testTracksSubmissionRevisionCount() {
        UUID practicalId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        Practical practical = Practical.builder().title("Exp 2").build();
        practical.setId(practicalId);
        when(practicalRepository.findById(practicalId)).thenReturn(Optional.of(practical));

        Submission existing = Submission.builder()
                .practicalId(practicalId)
                .studentId(studentId)
                .content("v1")
                .status("SUBMITTED")
                .build();
        UUID subId = UUID.randomUUID();
        existing.setId(subId);

        // First submission returns empty list
        when(submissionRepository.findByPracticalId(practicalId))
                .thenReturn(Collections.emptyList())
                .thenReturn(List.of(existing));

        when(submissionRepository.save(any(Submission.class))).thenReturn(existing);

        SubmissionRequest req1 = SubmissionRequest.builder()
                .practicalId(practicalId)
                .studentId(studentId)
                .content("v1")
                .build();
        SubmissionDto sub1 = submissionService.submitPractical(req1);
        assertEquals(1, sub1.getRevision());

        // Resubmission increments revision
        SubmissionRequest req2 = SubmissionRequest.builder()
                .practicalId(practicalId)
                .studentId(studentId)
                .content("v2 updated")
                .build();
        SubmissionDto sub2 = submissionService.submitPractical(req2);
        assertEquals(2, sub2.getRevision());
    }

    @Test
    @DisplayName("Boundary 23_3: Submission code containing null bytes handled safely")
    void testCodeWithNullBytes() {
        String codeWithNull = "public class Test {\0}";
        assertTrue(codeWithNull.contains("\0"));

        UUID practicalId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        when(practicalRepository.findById(practicalId)).thenReturn(Optional.empty());
        when(submissionRepository.findByPracticalId(practicalId)).thenReturn(Collections.emptyList());

        when(submissionRepository.save(any(Submission.class))).thenAnswer(invocation -> {
            Submission s = invocation.getArgument(0);
            if (s.getId() == null) {
                s.setId(UUID.randomUUID());
            }
            return s;
        });

        SubmissionRequest req = SubmissionRequest.builder()
                .practicalId(practicalId)
                .studentId(studentId)
                .content(codeWithNull)
                .build();

        SubmissionDto dto = submissionService.submitPractical(req);
        assertTrue(dto.getContent().contains("\0"));
        assertNotNull(dto.getSubmissionHash());
    }

    @Test
    @DisplayName("Boundary 23_4: Submission with 1MB source code string preserved")
    void testLargeCodeString1MB() {
        String bigCode = "// line\n".repeat(50000);
        assertTrue(bigCode.length() > 300000);

        UUID practicalId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        when(practicalRepository.findById(practicalId)).thenReturn(Optional.empty());
        when(submissionRepository.findByPracticalId(practicalId)).thenReturn(Collections.emptyList());

        when(submissionRepository.save(any(Submission.class))).thenAnswer(invocation -> {
            Submission s = invocation.getArgument(0);
            if (s.getId() == null) {
                s.setId(UUID.randomUUID());
            }
            return s;
        });

        SubmissionRequest req = SubmissionRequest.builder()
                .practicalId(practicalId)
                .studentId(studentId)
                .content(bigCode)
                .build();

        SubmissionDto dto = submissionService.submitPractical(req);
        assertEquals(bigCode.length(), dto.getContent().length());
    }

    @Test
    @DisplayName("Submission: Flags late submission when past due date")
    void testLateSubmissionFlag() {
        UUID practicalId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        // Due date 2 days ago
        Practical practical = Practical.builder()
                .title("Past Practical")
                .dueDate(Instant.now().minus(2, ChronoUnit.DAYS))
                .build();
        practical.setId(practicalId);

        when(practicalRepository.findById(practicalId)).thenReturn(Optional.of(practical));
        when(submissionRepository.findByPracticalId(practicalId)).thenReturn(Collections.emptyList());

        when(submissionRepository.save(any(Submission.class))).thenAnswer(invocation -> {
            Submission s = invocation.getArgument(0);
            if (s.getId() == null) {
                s.setId(UUID.randomUUID());
            }
            return s;
        });

        SubmissionRequest req = SubmissionRequest.builder()
                .practicalId(practicalId)
                .studentId(studentId)
                .content("code")
                .build();

        SubmissionDto dto = submissionService.submitPractical(req);
        assertTrue(dto.isLate());
    }

    @Test
    @DisplayName("Submission: Saves and recovers CRDT draft WAL entry")
    void testCrdtDraftSync() {
        UUID practicalId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();

        DraftSyncRequestDto draft = DraftSyncRequestDto.builder()
                .practicalId(practicalId)
                .studentId(studentId)
                .walVersion(42)
                .bufferContent("SELECT * FROM students WHERE id = ?")
                .cursorPosition("{\"lineNumber\":14,\"column\":28}")
                .checksum("sha256-mock")
                .build();

        submissionService.saveDraft(draft);

        DraftSyncRequestDto recovered = submissionService.getDraft(practicalId, studentId);
        assertNotNull(recovered);
        assertEquals(42, recovered.getWalVersion());
        assertEquals("SELECT * FROM students WHERE id = ?", recovered.getBufferContent());
    }
}
