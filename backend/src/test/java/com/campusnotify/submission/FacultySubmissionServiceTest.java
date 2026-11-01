package com.campusnotify.submission;

import com.campusnotify.repository.PracticalRepository;
import com.campusnotify.repository.SubmissionRepository;
import com.campusnotify.repository.UserRepository;
import com.campusnotify.submission.dto.*;
import com.campusnotify.submission.service.EmailNotificationService;
import com.campusnotify.submission.service.FacultySubmissionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.campusnotify.entity.Practical;
import com.campusnotify.entity.Submission;
import com.campusnotify.entity.User;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FacultySubmissionServiceTest {

    @Mock
    private SubmissionRepository submissionRepository;

    @Mock
    private PracticalRepository practicalRepository;

    @Mock
    private UserRepository userRepository;

    private FacultySubmissionService service;
    private EmailNotificationService emailService;

    @BeforeEach
    void setUp() {
        emailService = new EmailNotificationService();
        service = new FacultySubmissionService(
                submissionRepository,
                practicalRepository,
                userRepository,
                emailService
        );
    }

    // ==========================================
    // FEATURE 24: Faculty SubmissionListModal Backend
    // ==========================================
    @Test
    @DisplayName("F24_T01: Synthesizes virtual missing records for enrolled students without submissions")
    void testSynthesizesVirtualMissingRecords() {
        List<EnrolledStudentDto> enrolled = List.of(
                EnrolledStudentDto.builder().id("s1").name("Alice").rollNo("101").build(),
                EnrolledStudentDto.builder().id("s2").name("Bob").rollNo("102").build()
        );

        List<SubmissionDto> actual = List.of(
                SubmissionDto.builder()
                        .id(UUID.randomUUID())
                        .studentId(UUID.nameUUIDFromBytes("s1".getBytes()))
                        .status("SUBMITTED")
                        .marks(BigDecimal.valueOf(9.00))
                        .build()
        );

        // Adjust studentId to match "s1"
        actual.get(0).setStudentId(UUID.fromString("00000000-0000-0000-0000-000000000001"));
        enrolled.get(0).setId("00000000-0000-0000-0000-000000000001");

        List<BatchRosterItemDto> roster = service.synthesizeBatchRoster(enrolled, actual);

        assertEquals(2, roster.size());
        // Alice is actual submission
        assertFalse(roster.get(0).isVirtualMissing());
        assertEquals("SUBMITTED", roster.get(0).getStatus());

        // Bob is virtual missing
        assertTrue(roster.get(1).isVirtualMissing());
        assertEquals("UNSUBMITTED", roster.get(1).getStatus());
        assertEquals("Bob", roster.get(1).getStudentName());
    }

    @Test
    @DisplayName("F24_T02: Preserves existing submissions without alteration during synthesis")
    void testPreservesExistingSubmissionsUnmodified() {
        List<EnrolledStudentDto> enrolled = List.of(
                EnrolledStudentDto.builder().id("s1").name("Alice").build()
        );
        List<SubmissionDto> actual = List.of(
                SubmissionDto.builder()
                        .studentId(UUID.nameUUIDFromBytes("s1".getBytes()))
                        .marks(BigDecimal.valueOf(8.5))
                        .status("GRADED")
                        .build()
        );
        enrolled.get(0).setId(actual.get(0).getStudentId().toString());

        List<BatchRosterItemDto> roster = service.synthesizeBatchRoster(enrolled, actual);

        assertEquals(BigDecimal.valueOf(8.5), roster.get(0).getMarks());
        assertEquals("GRADED", roster.get(0).getStatus());
    }

    @Test
    @DisplayName("F24_T03: Handles 100% submission rate without generating virtual missing records")
    void testHandles100PercentSubmissionRate() {
        UUID s1 = UUID.randomUUID();
        UUID s2 = UUID.randomUUID();

        List<EnrolledStudentDto> enrolled = List.of(
                EnrolledStudentDto.builder().id(s1.toString()).build(),
                EnrolledStudentDto.builder().id(s2.toString()).build()
        );
        List<SubmissionDto> actual = List.of(
                SubmissionDto.builder().studentId(s1).status("SUBMITTED").build(),
                SubmissionDto.builder().studentId(s2).status("SUBMITTED").build()
        );

        List<BatchRosterItemDto> roster = service.synthesizeBatchRoster(enrolled, actual);
        assertTrue(roster.stream().noneMatch(BatchRosterItemDto::isVirtualMissing));
    }

    @Test
    @DisplayName("F24_T04: Handles 0% submission rate by marking all enrolled students as virtual missing")
    void testHandles0PercentSubmissionRate() {
        List<EnrolledStudentDto> enrolled = List.of(
                EnrolledStudentDto.builder().id("s1").build(),
                EnrolledStudentDto.builder().id("s2").build(),
                EnrolledStudentDto.builder().id("s3").build()
        );

        List<BatchRosterItemDto> roster = service.synthesizeBatchRoster(enrolled, Collections.emptyList());

        assertEquals(3, roster.size());
        assertTrue(roster.stream().allMatch(r -> r.isVirtualMissing() && "UNSUBMITTED".equals(r.getStatus())));
    }

    @Test
    @DisplayName("F24_T05: Retains student name and roll number metadata on virtual missing entries")
    void testRetainsStudentNameAndRollNoMetadata() {
        List<EnrolledStudentDto> enrolled = List.of(
                EnrolledStudentDto.builder().id("s5").name("Eve").rollNo("105").build()
        );

        List<BatchRosterItemDto> roster = service.synthesizeBatchRoster(enrolled, Collections.emptyList());

        assertEquals("Eve", roster.get(0).getStudentName());
        assertEquals("105", roster.get(0).getRollNo());
    }

    @Test
    @DisplayName("Boundary 24_1: Enrolled students list empty produces empty roster")
    void testEnrolledEmptyProducesEmptyRoster() {
        List<BatchRosterItemDto> roster = service.synthesizeBatchRoster(Collections.emptyList(), Collections.emptyList());
        assertEquals(0, roster.size());
    }

    @Test
    @DisplayName("Boundary 24_2: Single enrolled student without submission yields single virtual record")
    void testSingleEnrolledStudentWithoutSubmission() {
        List<EnrolledStudentDto> enrolled = List.of(
                EnrolledStudentDto.builder().id("s1").name("Alone").build()
        );
        List<BatchRosterItemDto> roster = service.synthesizeBatchRoster(enrolled, Collections.emptyList());
        assertEquals(1, roster.size());
        assertTrue(roster.get(0).isVirtualMissing());
    }

    @Test
    @DisplayName("Boundary 24_3: Student submission missing studentId field handled safely")
    void testSubmissionMissingStudentIdHandledSafely() {
        List<EnrolledStudentDto> enrolled = List.of(
                EnrolledStudentDto.builder().id("s1").build()
        );
        List<SubmissionDto> actual = List.of(
                SubmissionDto.builder().id(UUID.randomUUID()).studentId(null).build()
        );

        List<BatchRosterItemDto> roster = service.synthesizeBatchRoster(enrolled, actual);
        assertEquals(1, roster.size());
        assertTrue(roster.get(0).isVirtualMissing());
    }

    @Test
    @DisplayName("Boundary 24_4: Synthesis scale test: 500 enrolled students")
    void testSynthesisScale500Students() {
        List<EnrolledStudentDto> enrolled = new ArrayList<>();
        List<SubmissionDto> actual = new ArrayList<>();

        for (int i = 0; i < 500; i++) {
            UUID sId = UUID.randomUUID();
            enrolled.add(EnrolledStudentDto.builder()
                    .id(sId.toString())
                    .name("Student " + i)
                    .build());

            if (i < 250) {
                actual.add(SubmissionDto.builder()
                        .studentId(sId)
                        .status("SUBMITTED")
                        .build());
            }
        }

        List<BatchRosterItemDto> roster = service.synthesizeBatchRoster(enrolled, actual);

        assertEquals(500, roster.size());
        long missingCount = roster.stream().filter(BatchRosterItemDto::isVirtualMissing).count();
        assertEquals(250, missingCount);
    }

    @Test
    @DisplayName("Boundary 24_5: Preserves virtual record rollNo as undefined/null if missing in enrollment")
    void testPreservesRollNoNullIfMissing() {
        List<EnrolledStudentDto> enrolled = List.of(
                EnrolledStudentDto.builder().id("s_noroll").name("No Roll").rollNo(null).build()
        );

        List<BatchRosterItemDto> roster = service.synthesizeBatchRoster(enrolled, Collections.emptyList());
        assertNull(roster.get(0).getRollNo());
    }

    // ==========================================
    // FEATURE 25: Bulk Grading & Redo Request Dispatch
    // ==========================================
    @Test
    @DisplayName("F25_T01: Applies bulk grades and feedback across an array of submissions")
    void testAppliesBulkGradesAndFeedback() {
        List<BulkGradeItemDto> grades = List.of(
                BulkGradeItemDto.builder().submissionId("sub_1").marks(9.0).feedback("Well structured").build(),
                BulkGradeItemDto.builder().submissionId("sub_2").marks(8.0).feedback("Good comments").build()
        );

        List<BulkGradeResultDto> results = service.bulkGradeSubmissions(grades);

        assertEquals(2, results.size());
        assertEquals("GRADED", results.get(0).getStatus());
        assertEquals(9.0, results.get(0).getMarks());
        assertEquals(8.0, results.get(1).getMarks());
    }

    @Test
    @DisplayName("F25_T02: Clamps marks exceeding 10 to maximum 10 during bulk grading")
    void testClampsMarksExceeding10() {
        List<BulkGradeItemDto> grades = List.of(
                BulkGradeItemDto.builder().submissionId("sub_ovf").marks(12.0).build()
        );

        List<BulkGradeResultDto> results = service.bulkGradeSubmissions(grades);
        assertEquals(10.0, results.get(0).getMarks());
    }

    @Test
    @DisplayName("F25_T03: Dispatches redo request with explanatory email payload")
    void testDispatchesRedoRequest() {
        RedoResponseDto res = service.dispatchRedoRequest("sub_redo_1", "Incomplete test case coverage");

        assertTrue(res.isRedoRequested());
        assertEquals("Incomplete test case coverage", res.getReason());
        assertTrue(res.isEmailDispatched());
    }

    @Test
    @DisplayName("F25_T04: Bulk grade handles empty input array without error")
    void testBulkGradeHandlesEmptyArray() {
        List<BulkGradeResultDto> results = service.bulkGradeSubmissions(Collections.emptyList());
        assertEquals(0, results.size());
    }

    @Test
    @DisplayName("F25_T05: Redo request records timestamp of notification dispatch")
    void testRedoRequestRecordsTimestamp() {
        RedoResponseDto res = service.dispatchRedoRequest("sub_redo_2", "Plagiarism suspected");
        assertTrue(res.getDispatchedAt() > 0);
    }

    @Test
    @DisplayName("Boundary 25_1: Bulk grade marks negative number clamped to 0")
    void testBulkGradeNegativeClampedToZero() {
        List<BulkGradeItemDto> batch = List.of(
                BulkGradeItemDto.builder().submissionId("s1").marks(-5.0).build()
        );
        List<BulkGradeResultDto> res = service.bulkGradeSubmissions(batch);
        assertEquals(0.0, res.get(0).getMarks());
    }

    @Test
    @DisplayName("Boundary 25_2: Bulk grade marks > 10 clamped to 10")
    void testBulkGradeAbove10ClampedTo10() {
        List<BulkGradeItemDto> batch = List.of(
                BulkGradeItemDto.builder().submissionId("s1").marks(15.0).build()
        );
        List<BulkGradeResultDto> res = service.bulkGradeSubmissions(batch);
        assertEquals(10.0, res.get(0).getMarks());
    }

    @Test
    @DisplayName("Boundary 25_3: Redo request with empty reason string handled without failure")
    void testRedoRequestEmptyReason() {
        RedoResponseDto res = service.dispatchRedoRequest("sub_empty_reason", "");
        assertEquals("", res.getReason());
        assertTrue(res.isRedoRequested());
    }

    @Test
    @DisplayName("Boundary 25_4: Bulk grade array with 1,000 entries processes within 100ms")
    void testBulkGradeScale1000Entries() {
        List<BulkGradeItemDto> batch = new ArrayList<>(1000);
        for (int i = 0; i < 1000; i++) {
            batch.add(BulkGradeItemDto.builder()
                    .submissionId("sub_" + i)
                    .marks((double) (i % 11))
                    .build());
        }

        long t0 = System.currentTimeMillis();
        List<BulkGradeResultDto> res = service.bulkGradeSubmissions(batch);
        long elapsed = System.currentTimeMillis() - t0;

        assertEquals(1000, res.size());
        assertTrue(elapsed < 100, "Processing 1000 entries took " + elapsed + "ms (expected < 100ms)");
    }

    @Test
    @DisplayName("Boundary 25_5: Feedback string with 2,000 characters preserved")
    void testFeedbackString2000CharsPreserved() {
        String longFeedback = "F".repeat(2000);
        List<BulkGradeItemDto> batch = List.of(
                BulkGradeItemDto.builder().submissionId("s_long").marks(8.0).feedback(longFeedback).build()
        );

        List<BulkGradeResultDto> res = service.bulkGradeSubmissions(batch);
        assertEquals(2000, res.get(0).getFeedback().length());
    }

    @Test
    @DisplayName("Adversarial F25_A01: Dispatches redo email to real student email and practical title from entities")
    void testDispatchesRedoEmailToRealStudentEntity() {
        UUID subId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();
        UUID practicalId = UUID.randomUUID();

        Submission sub = Submission.builder()
                .studentId(studentId)
                .practicalId(practicalId)
                .status("SUBMITTED")
                .marks(BigDecimal.valueOf(5.0))
                .build();
        sub.setId(subId);

        User student = User.builder()
                .username("aditi_patil")
                .email("aditi.patil@spit.ac.in")
                .fullName("Aditi Patil")
                .department("IT")
                .build();
        student.setId(studentId);

        Practical practical = Practical.builder()
                .title("Operating Systems Deadlock Detection Lab")
                .subjectCode("ITC501")
                .practicalNo(4)
                .build();
        practical.setId(practicalId);

        when(submissionRepository.findById(subId)).thenReturn(Optional.of(sub));
        when(userRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(practicalRepository.findById(practicalId)).thenReturn(Optional.of(practical));

        RedoResponseDto res = service.dispatchRedoRequest(subId.toString(), "Banker's algorithm edge case missing");

        assertTrue(res.isRedoRequested());
        assertTrue(res.isEmailDispatched());
        assertNull(sub.getMarks(), "Marks should be nullified upon redo request");
        assertEquals("REDO_REQUESTED", sub.getStatus());

        List<EmailNotificationService.DispatchedEmail> dispatched = emailService.getDispatchedEmails();
        assertFalse(dispatched.isEmpty());
        EmailNotificationService.DispatchedEmail email = dispatched.get(dispatched.size() - 1);
        assertEquals("aditi.patil@spit.ac.in", email.getRecipientEmail());
        assertTrue(email.getSubject().contains("Operating Systems Deadlock Detection Lab"));
    }
}
