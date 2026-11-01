package com.campusnotify.academic;

import com.campusnotify.academic.dto.FacultyCandidateDto;
import com.campusnotify.academic.dto.TimetableSlotDto;
import com.campusnotify.academic.service.LectureSubstitutionService;
import com.campusnotify.academic.service.LectureSubstitutionService.InMemorySwap;
import com.campusnotify.academic.service.LectureSubstitutionService.SubstitutionApprovalResult;
import com.campusnotify.repository.SubstitutionRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class LectureSubstitutionTest {

    @Mock
    private SubstitutionRequestRepository substitutionRequestRepository;

    private LectureSubstitutionService substitutionService;

    @BeforeEach
    void setUp() {
        substitutionService = new LectureSubstitutionService(substitutionRequestRepository);
    }

    @Test
    @DisplayName("F15_T01: Identifies qualified department faculty without timetable conflict")
    void testFindEligibleSubstitutes() {
        TimetableSlotDto slot = TimetableSlotDto.builder()
                .id("slot_1")
                .dept("IT")
                .subject("Data Structures")
                .build();

        List<FacultyCandidateDto> facultyList = List.of(
                FacultyCandidateDto.builder().id("f1").dept("IT").competencies(List.of("Data Structures")).busySlotIds(List.of()).build(),
                FacultyCandidateDto.builder().id("f2").dept("IT").competencies(List.of("Data Structures")).busySlotIds(List.of("slot_1")).build(), // conflict
                FacultyCandidateDto.builder().id("f3").dept("EXTC").competencies(List.of("Data Structures")).busySlotIds(List.of()).build() // wrong dept
        );

        List<FacultyCandidateDto> eligible = substitutionService.findEligibleSubstitutes(slot, facultyList);
        assertEquals(1, eligible.size());
        assertEquals("f1", eligible.get(0).getId());
    }

    @Test
    @DisplayName("F15_T02: Creates swap request in PENDING_SUBSTITUTE_ACCEPTANCE status")
    void testRequestSwapStatus() {
        InMemorySwap swap = substitutionService.requestSwap("slot_1", "f_absent", "f_substitute", "Medical Leave");
        assertEquals("PENDING_SUBSTITUTE_ACCEPTANCE", swap.getStatus());
        assertEquals("f_absent", swap.getRequestingFacultyId());
        assertEquals("f_substitute", swap.getSubstituteFacultyId());
    }

    @Test
    @DisplayName("F15_T03: Allows HOD 1-click approval once accepted by substitute and triggers cache purge")
    void testHodApprovalWithCachePurge() {
        InMemorySwap swap = substitutionService.requestSwap("slot_1", "f_absent", "f_substitute", "Conference");
        substitutionService.acceptSwap(swap.getId());

        SubstitutionApprovalResult result = substitutionService.approveSwapByHod(swap.getId(), "hod_it");
        assertEquals("APPROVED_BY_HOD", result.getSwap().getStatus());
        assertTrue(result.isTriggerCachePurge());
    }

    @Test
    @DisplayName("F15_T04: Rejects HOD approval before substitute has accepted invitation")
    void testRejectsHodApprovalBeforeAcceptance() {
        InMemorySwap swap = substitutionService.requestSwap("slot_2", "f_absent", "f_sub", "Personal");
        assertThrows(IllegalStateException.class, () -> substitutionService.approveSwapByHod(swap.getId(), "hod_it"));
    }

    @Test
    @DisplayName("F15_T05: Returns empty list when no faculty are free or qualified")
    void testNoEligibleFacultyFound() {
        TimetableSlotDto slot = TimetableSlotDto.builder()
                .id("slot_9")
                .dept("IT")
                .subject("Cloud Computing")
                .build();
        List<FacultyCandidateDto> facultyList = List.of(
                FacultyCandidateDto.builder().id("f_busy").dept("IT").competencies(List.of("Cloud Computing")).busySlotIds(List.of("slot_9")).build()
        );
        List<FacultyCandidateDto> eligible = substitutionService.findEligibleSubstitutes(slot, facultyList);
        assertTrue(eligible.isEmpty());
    }

    @Test
    @DisplayName("F15_B01: Slot at early morning 8:00 AM matches properly")
    void testEarlyMorningSlot() {
        TimetableSlotDto slot = TimetableSlotDto.builder().id("slot_8am").dept("IT").subject("OS").time("08:00").build();
        List<FacultyCandidateDto> fac = List.of(FacultyCandidateDto.builder().id("f1").dept("IT").competencies(List.of("OS")).busySlotIds(List.of()).build());
        assertEquals(1, substitutionService.findEligibleSubstitutes(slot, fac).size());
    }

    @Test
    @DisplayName("F15_B02: Slot at late evening 5:00 PM matches properly")
    void testLateEveningSlot() {
        TimetableSlotDto slot = TimetableSlotDto.builder().id("slot_5pm").dept("IT").subject("OS").time("17:00").build();
        List<FacultyCandidateDto> fac = List.of(FacultyCandidateDto.builder().id("f1").dept("IT").competencies(List.of("OS")).busySlotIds(List.of()).build());
        assertEquals(1, substitutionService.findEligibleSubstitutes(slot, fac).size());
    }

    @Test
    @DisplayName("F15_B03: Faculty with empty competencies list never matches")
    void testEmptyCompetencies() {
        TimetableSlotDto slot = TimetableSlotDto.builder().id("s1").dept("IT").subject("AI").build();
        List<FacultyCandidateDto> fac = List.of(FacultyCandidateDto.builder().id("f_none").dept("IT").competencies(List.of()).busySlotIds(List.of()).build());
        assertEquals(0, substitutionService.findEligibleSubstitutes(slot, fac).size());
    }

    @Test
    @DisplayName("F15_B04: Faculty with busy slots matching target slot ID excluded")
    void testBusyFacultyExcluded() {
        TimetableSlotDto slot = TimetableSlotDto.builder().id("s_target").dept("IT").subject("Math").build();
        List<FacultyCandidateDto> fac = List.of(FacultyCandidateDto.builder().id("f_busy").dept("IT").competencies(List.of("Math")).busySlotIds(List.of("s1", "s2", "s_target")).build());
        assertEquals(0, substitutionService.findEligibleSubstitutes(slot, fac).size());
    }

    @Test
    @DisplayName("F15_B05: HOD approval idempotency check: approving twice throws exception")
    void testApprovalIdempotency() {
        InMemorySwap swap = substitutionService.requestSwap("s_idem", "f1", "f2", "Urgent");
        substitutionService.acceptSwap(swap.getId());
        substitutionService.approveSwapByHod(swap.getId(), "hod");

        assertThrows(IllegalStateException.class, () -> substitutionService.approveSwapByHod(swap.getId(), "hod"));
    }
}
