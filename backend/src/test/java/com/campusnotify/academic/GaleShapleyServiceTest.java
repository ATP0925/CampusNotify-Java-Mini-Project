package com.campusnotify.academic;

import com.campusnotify.academic.dto.FacultyGuideDto;
import com.campusnotify.academic.dto.ProjectGroupDto;
import com.campusnotify.academic.service.GaleShapleyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class GaleShapleyServiceTest {

    private GaleShapleyService galeShapleyService;

    @BeforeEach
    void setUp() {
        galeShapleyService = new GaleShapleyService();
    }

    @Test
    @DisplayName("F18_T01: Produces stable matching respecting faculty quotas and group preferences")
    void testStableMatchingQuotasAndPreferences() {
        List<ProjectGroupDto> groups = List.of(
                ProjectGroupDto.builder().id("g1").preferences(List.of("guide_A", "guide_B")).cgpa(new BigDecimal("9.2")).rigor(new BigDecimal("8.5")).domainMatch(new BigDecimal("9.0")).build(),
                ProjectGroupDto.builder().id("g2").preferences(List.of("guide_A", "guide_B")).cgpa(new BigDecimal("8.5")).rigor(new BigDecimal("8.0")).domainMatch(new BigDecimal("7.5")).build()
        );
        List<FacultyGuideDto> guides = List.of(
                FacultyGuideDto.builder().id("guide_A").capacity(1).build(),
                FacultyGuideDto.builder().id("guide_B").capacity(1).build()
        );

        Map<String, List<String>> matching = galeShapleyService.runMatching(groups, guides);
        assertEquals(List.of("g1"), matching.get("guide_A"));
        assertEquals(List.of("g2"), matching.get("guide_B"));
    }

    @Test
    @DisplayName("F18_T02: Enforces strict capacity limit on each faculty guide")
    void testStrictCapacityEnforced() {
        List<ProjectGroupDto> groups = List.of(
                ProjectGroupDto.builder().id("g1").preferences(List.of("guide_X")).cgpa(new BigDecimal("9.0")).build(),
                ProjectGroupDto.builder().id("g2").preferences(List.of("guide_X")).cgpa(new BigDecimal("8.0")).build(),
                ProjectGroupDto.builder().id("g3").preferences(List.of("guide_X")).cgpa(new BigDecimal("7.0")).build()
        );
        List<FacultyGuideDto> guides = List.of(
                FacultyGuideDto.builder().id("guide_X").capacity(2).build()
        );

        Map<String, List<String>> matching = galeShapleyService.runMatching(groups, guides);
        assertEquals(2, matching.get("guide_X").size(), "Must not exceed capacity 2");
    }

    @Test
    @DisplayName("F18_T03: Deterministic tie-breaking using SHA-256 hash when composite scores tie")
    void testDeterministicTieBreaking() {
        List<ProjectGroupDto> groups = List.of(
                ProjectGroupDto.builder().id("group_Alpha").preferences(List.of("guide_T")).cgpa(new BigDecimal("8.0")).rigor(new BigDecimal("8.0")).domainMatch(new BigDecimal("8.0")).build(),
                ProjectGroupDto.builder().id("group_Beta").preferences(List.of("guide_T")).cgpa(new BigDecimal("8.0")).rigor(new BigDecimal("8.0")).domainMatch(new BigDecimal("8.0")).build()
        );
        List<FacultyGuideDto> guides = List.of(
                FacultyGuideDto.builder().id("guide_T").capacity(1).build()
        );

        Map<String, List<String>> m1 = galeShapleyService.runMatching(groups, guides);
        Map<String, List<String>> m2 = galeShapleyService.runMatching(groups, guides);

        assertEquals(1, m1.get("guide_T").size());
        assertEquals(m1.get("guide_T").get(0), m2.get("guide_T").get(0), "Deterministic winner must be identical across runs");
    }

    @Test
    @DisplayName("F18_T04: Guarantees group-optimal stable allocation without blocking pairs")
    void testGroupOptimalStableAllocation() {
        List<ProjectGroupDto> groups = List.of(
                ProjectGroupDto.builder().id("g1").preferences(List.of("gA", "gB")).cgpa(new BigDecimal("9.0")).build(),
                ProjectGroupDto.builder().id("g2").preferences(List.of("gB", "gA")).cgpa(new BigDecimal("8.5")).build()
        );
        List<FacultyGuideDto> guides = List.of(
                FacultyGuideDto.builder().id("gA").capacity(1).build(),
                FacultyGuideDto.builder().id("gB").capacity(1).build()
        );

        Map<String, List<String>> matching = galeShapleyService.runMatching(groups, guides);
        assertEquals(List.of("g1"), matching.get("gA"));
        assertEquals(List.of("g2"), matching.get("gB"));
    }

    @Test
    @DisplayName("F18_T05: Handles unassigned groups gracefully when all preferred guides are at capacity")
    void testUnassignedGroupsGraceful() {
        List<ProjectGroupDto> groups = List.of(
                ProjectGroupDto.builder().id("g1").preferences(List.of("gFull")).cgpa(new BigDecimal("9.5")).build(),
                ProjectGroupDto.builder().id("g2").preferences(List.of("gFull")).cgpa(new BigDecimal("6.0")).build()
        );
        List<FacultyGuideDto> guides = List.of(
                FacultyGuideDto.builder().id("gFull").capacity(1).build()
        );

        Map<String, List<String>> matching = galeShapleyService.runMatching(groups, guides);
        assertEquals(List.of("g1"), matching.get("gFull"));
    }

    @Test
    @DisplayName("F18_B02: Guide with capacity 0 accepts 0 groups")
    void testZeroCapacityGuide() {
        List<ProjectGroupDto> groups = List.of(ProjectGroupDto.builder().id("g1").preferences(List.of("zero_cap")).cgpa(new BigDecimal("9.0")).build());
        List<FacultyGuideDto> guides = List.of(FacultyGuideDto.builder().id("zero_cap").capacity(0).build());
        Map<String, List<String>> matching = galeShapleyService.runMatching(groups, guides);
        assertEquals(0, matching.get("zero_cap").size());
    }

    @Test
    @DisplayName("F18_B03: Empty group preference list results in unassigned group")
    void testEmptyPreferenceList() {
        List<ProjectGroupDto> groups = List.of(ProjectGroupDto.builder().id("g_empty").preferences(List.of()).cgpa(new BigDecimal("9.9")).build());
        List<FacultyGuideDto> guides = List.of(FacultyGuideDto.builder().id("gA").capacity(2).build());
        Map<String, List<String>> matching = galeShapleyService.runMatching(groups, guides);
        assertEquals(0, matching.get("gA").size());
    }

    @Test
    @DisplayName("F18_B05: Matching 10 groups to 5 guides with capacity 2 fills all slots")
    void testTenGroupsFiveGuidesCapacityTwo() {
        List<ProjectGroupDto> groups = new ArrayList<>();
        List<String> allGuides = List.of("guide_0", "guide_1", "guide_2", "guide_3", "guide_4");
        for (int i = 0; i < 10; i++) {
            groups.add(ProjectGroupDto.builder()
                    .id("grp_" + i)
                    .preferences(allGuides)
                    .cgpa(BigDecimal.valueOf(7.0 + (i * 0.2)))
                    .build());
        }
        List<FacultyGuideDto> guides = List.of(
                FacultyGuideDto.builder().id("guide_0").capacity(2).build(),
                FacultyGuideDto.builder().id("guide_1").capacity(2).build(),
                FacultyGuideDto.builder().id("guide_2").capacity(2).build(),
                FacultyGuideDto.builder().id("guide_3").capacity(2).build(),
                FacultyGuideDto.builder().id("guide_4").capacity(2).build()
        );

        Map<String, List<String>> matching = galeShapleyService.runMatching(groups, guides);
        int totalAssigned = matching.values().stream().mapToInt(List::size).sum();
        assertEquals(10, totalAssigned);
    }
}
