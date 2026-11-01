package com.campusnotify.entity;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class CoreDomainEntitiesTest {

    @Test
    void testAll21DomainEntitiesInstantiationAndInvariants() {
        UUID id = UUID.randomUUID();

        // 1. User
        User user = User.builder()
                .username("test_user")
                .email("test@campusnotify.edu")
                .fullName("Test User")
                .department("IT")
                .build();
        user.setId(id);
        assertFalse(user.isArchived());
        user.softDelete();
        assertTrue(user.isArchived());

        // 2. Role
        Role role = Role.builder().name(RoleType.STUDENT).description("Student Role").build();
        role.setId(id);
        assertEquals(RoleType.STUDENT, role.getName());

        // 3. AuditLog
        AuditLog auditLog = AuditLog.builder()
                .userId(id)
                .eventType("ATTENDANCE_SCANNED")
                .hashChain("hash123")
                .build();
        assertEquals("ATTENDANCE_SCANNED", auditLog.getEventType());

        // 4. RefreshToken
        RefreshToken refreshToken = RefreshToken.builder()
                .token("ref_token_123")
                .userId(id)
                .expiryDate(Instant.now().plusSeconds(3600))
                .jti("jti-123")
                .build();
        assertFalse(refreshToken.isExpired());

        // 5. LabAsset
        LabAsset labAsset = LabAsset.builder()
                .assetCode("ASSET-01")
                .name("Cisco Switch")
                .labRoom("Lab 103")
                .status("AVAILABLE")
                .build();
        assertEquals("Lab 103", labAsset.getLabRoom());

        // 6. Practical
        Practical practical = Practical.builder()
                .title("RSA Encryption Lab")
                .subjectCode("CS401")
                .practicalNo(1)
                .maxMarks(BigDecimal.valueOf(10.0))
                .rollSeedParameterized(true)
                .build();
        assertTrue(practical.isRollSeedParameterized());

        // 7. Assignment
        Assignment assignment = Assignment.builder()
                .title("CO-PO Direct Attainment Theory")
                .subjectCode("CS401")
                .assignmentNo(1)
                .build();
        assertEquals(1, assignment.getAssignmentNo());

        // 8. Submission
        Submission submission = Submission.builder()
                .practicalId(id)
                .studentId(id)
                .status("SUBMITTED")
                .marks(BigDecimal.valueOf(9.5))
                .build();
        assertEquals("SUBMITTED", submission.getStatus());

        // 9. AttendanceRecord
        AttendanceRecord attRecord = AttendanceRecord.builder()
                .sessionId(id)
                .studentId(id)
                .status("PRESENT")
                .clientLat(19.0475)
                .clientLng(72.8710)
                .verificationMode("QR_TOTP")
                .build();
        assertEquals("QR_TOTP", attRecord.getVerificationMode());

        // 10. TimetableSlot
        TimetableSlot slot = TimetableSlot.builder()
                .department("IT")
                .subjectCode("CS401")
                .facultyId(id)
                .roomNumber("Lab 203")
                .dayOfWeek("MONDAY")
                .startTime("09:00")
                .endTime("11:00")
                .build();
        assertEquals("MONDAY", slot.getDayOfWeek());

        // 11. SubstitutionRequest
        SubstitutionRequest subRequest = SubstitutionRequest.builder()
                .timetableSlotId(id)
                .requestingFacultyId(id)
                .substituteFacultyId(id)
                .status("REQUESTED")
                .build();
        assertEquals("REQUESTED", subRequest.getStatus());

        // 12. NoDuesNode
        NoDuesNode node = NoDuesNode.builder()
                .nodeCode("LIBRARY")
                .name("Central Library")
                .sequenceOrder(1)
                .isMandatory(true)
                .build();
        assertEquals("LIBRARY", node.getNodeCode());

        // 13. NoDuesClearance
        NoDuesClearance clearance = NoDuesClearance.builder()
                .studentId(id)
                .nodeCode("LIBRARY")
                .status("CLEARED")
                .pendingAmount(BigDecimal.ZERO)
                .build();
        assertEquals("CLEARED", clearance.getStatus());

        // 14. ProjectGroup
        ProjectGroup group = ProjectGroup.builder()
                .groupName("AI Viva Group")
                .academicYear("2026-2027")
                .leaderId(id)
                .allocationStatus("MATCHED")
                .build();
        assertEquals("MATCHED", group.getAllocationStatus());

        // 15. GuideAllocation
        GuideAllocation guide = GuideAllocation.builder()
                .facultyId(id)
                .maxCapacity(4)
                .currentAllocated(2)
                .academicYear("2026-2027")
                .build();
        assertEquals(4, guide.getMaxCapacity());

        // 16. BlindFeedbackToken
        BlindFeedbackToken feedbackToken = BlindFeedbackToken.builder()
                .blindedTokenHash("blind_hash_123")
                .semester(7)
                .academicYear("2026-2027")
                .isSpent(false)
                .build();
        assertFalse(feedbackToken.isSpent());

        // 17. FeedbackSubmission
        FeedbackSubmission feedbackSub = FeedbackSubmission.builder()
                .facultyId(id)
                .subjectCode("CS401")
                .blindedTokenHash("blind_hash_123")
                .ratingClarity(5)
                .ratingPunctuality(5)
                .ratingKnowledge(5)
                .build();
        assertEquals(5, feedbackSub.getRatingClarity());

        // 18. CoPoMatrix
        CoPoMatrix coPo = CoPoMatrix.builder()
                .subjectCode("CS401")
                .coCode("CO1")
                .poCode("PO1")
                .correlationLevel(3)
                .academicYear("2026-2027")
                .build();
        assertEquals(3, coPo.getCorrelationLevel());

        // 19. TermWorkRecord
        TermWorkRecord tw = TermWorkRecord.builder()
                .studentId(id)
                .subjectCode("CS401")
                .academicYear("2026-2027")
                .attendanceMarks(BigDecimal.valueOf(5.0))
                .labMarks(BigDecimal.valueOf(14.5))
                .vivaMarks(BigDecimal.valueOf(4.5))
                .totalMarks(BigDecimal.valueOf(24.0))
                .isDefaulter(false)
                .build();
        assertEquals(BigDecimal.valueOf(24.0), tw.getTotalMarks());
        assertFalse(tw.isDefaulter());

        // 20. ProctoringViolation
        ProctoringViolation violation = ProctoringViolation.builder()
                .submissionId(id)
                .studentId(id)
                .violationType("BURST_INJECTION_DETECTED")
                .characterDelta(120)
                .timeDeltaMs(45)
                .velocityCharsPerSec(2666.0)
                .build();
        assertEquals("BURST_INJECTION_DETECTED", violation.getViolationType());

        // 21. HallTicket
        HallTicket hallTicket = HallTicket.builder()
                .studentId(id)
                .semester(7)
                .academicYear("2026-2027")
                .isLocked(false)
                .build();
        assertFalse(hallTicket.isLocked());
    }
}
