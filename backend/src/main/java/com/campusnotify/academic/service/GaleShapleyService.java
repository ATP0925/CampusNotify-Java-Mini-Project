package com.campusnotify.academic.service;

import com.campusnotify.academic.dto.FacultyGuideDto;
import com.campusnotify.academic.dto.ProjectGroupDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Feature 18: Gale-Shapley Stable Matching Guide Allocation Algorithm.
 * Implements Group-Proposing Deferred Acceptance for Sem 7/8 Major Project allocation.
 * Computes multi-criteria composite scores (0.40 * CGPA + 0.35 * Rigor + 0.25 * DomainMatch),
 * breaks ties deterministically using SHA-256 hashing, enforces strict faculty capacity limits,
 * and guarantees stable matching with zero blocking pairs.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GaleShapleyService {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    private static class ScoredGroup {
        private String groupId;
        private double score;
        private String hash;
    }

    /**
     * Executes the group-proposing Gale-Shapley deferred acceptance algorithm.
     * Returns a map of guideId -> list of matched groupIds.
     */
    public Map<String, List<String>> runMatching(List<ProjectGroupDto> groups, List<FacultyGuideDto> guides) {
        if (groups == null || guides == null) {
            return Collections.emptyMap();
        }

        // 1. Compute guide preference rankings over groups
        Map<String, List<String>> guideRankings = new HashMap<>();
        for (FacultyGuideDto guide : guides) {
            List<ScoredGroup> scored = groups.stream().map(g -> {
                double cgpa = g.getCgpa() != null ? g.getCgpa().doubleValue() : 7.0;
                double rigor = g.getRigor() != null ? g.getRigor().doubleValue() : 5.0;
                double domain = g.getDomainMatch() != null ? g.getDomainMatch().doubleValue() : 5.0;
                double score = (0.40 * cgpa) + (0.35 * rigor) + (0.25 * domain);
                String hash = DigestUtils.sha256Hex(g.getId());
                return new ScoredGroup(g.getId(), score, hash);
            }).collect(Collectors.toList());

            // Sort desc by score; tie-break deterministically using SHA-256 hash lexicographically
            scored.sort((a, b) -> {
                if (Double.compare(b.score, a.score) != 0) {
                    return Double.compare(b.score, a.score);
                }
                return a.hash.compareTo(b.hash);
            });

            guideRankings.put(guide.getId(), scored.stream().map(ScoredGroup::getGroupId).collect(Collectors.toList()));
        }

        // 2. Initialize deferred acceptance queues
        Queue<String> unassignedGroups = new LinkedList<>(groups.stream().map(ProjectGroupDto::getId).collect(Collectors.toList()));
        Map<String, List<String>> groupPrefs = new HashMap<>();
        for (ProjectGroupDto g : groups) {
            groupPrefs.put(g.getId(), g.getPreferences() != null ? new ArrayList<>(g.getPreferences()) : new ArrayList<>());
        }

        Map<String, List<String>> guideMatches = new HashMap<>();
        Map<String, Integer> guideCapacities = new HashMap<>();
        for (FacultyGuideDto guide : guides) {
            guideMatches.put(guide.getId(), new ArrayList<>());
            guideCapacities.put(guide.getId(), guide.getCapacity());
        }

        // 3. Proposing loop
        while (!unassignedGroups.isEmpty()) {
            String groupId = unassignedGroups.poll();
            List<String> prefs = groupPrefs.get(groupId);

            if (prefs == null || prefs.isEmpty()) {
                // Group has exhausted all preferred guides; remains unassigned
                continue;
            }

            String preferredGuideId = prefs.remove(0);
            if (!guideMatches.containsKey(preferredGuideId)) {
                // Preferred guide not found in list, retry next preference
                unassignedGroups.add(groupId);
                continue;
            }

            int capacity = guideCapacities.getOrDefault(preferredGuideId, 0);
            if (capacity <= 0) {
                // Guide has 0 capacity, immediately reject group
                unassignedGroups.add(groupId);
                continue;
            }

            List<String> currentMatches = guideMatches.get(preferredGuideId);
            currentMatches.add(groupId);

            if (currentMatches.size() > capacity) {
                // Guide rejects their least-preferred group
                List<String> ranking = guideRankings.get(preferredGuideId);
                currentMatches.sort(Comparator.comparingInt(ranking::indexOf));
                String rejectedGroupId = currentMatches.remove(currentMatches.size() - 1);
                unassignedGroups.add(rejectedGroupId);
            }
        }

        log.info("Gale-Shapley matching completed. Total guides: {}, matched results: {}", guides.size(), guideMatches);
        return guideMatches;
    }

    /**
     * Helper to compute composite score.
     */
    public BigDecimal computeCompositeScore(BigDecimal cgpa, BigDecimal rigor, BigDecimal domainMatch) {
        double c = cgpa != null ? cgpa.doubleValue() : 7.0;
        double r = rigor != null ? rigor.doubleValue() : 5.0;
        double d = domainMatch != null ? domainMatch.doubleValue() : 5.0;
        double res = (0.40 * c) + (0.35 * r) + (0.25 * d);
        return BigDecimal.valueOf(res).setScale(4, java.math.RoundingMode.HALF_UP);
    }
}
