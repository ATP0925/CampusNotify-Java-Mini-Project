package com.campusnotify.academic.service;

import com.campusnotify.academic.dto.DefaulterEvaluationDto;
import com.campusnotify.entity.HallTicket;
import com.campusnotify.repository.HallTicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Feature 13: Continuous 3-Tier Defaulter Pipeline.
 * Checkpoint D1 (Day 30): Warning (<75%)
 * Checkpoint D2 (Day 60): Parent intimation & collegiate warning (<75%)
 * Checkpoint D3 (Day 90): Detention hearing, HOD undertaking & hall ticket lock (<75%)
 * Enforces Mumbai University 15% medical grace cap (requires raw attendance >= 60.00%).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DefaulterPipelineService {

    private final HallTicketRepository hallTicketRepository;

    /**
     * Evaluates student defaulter tier at a given day checkpoint (e.g. Day 30, 60, 90).
     */
    public DefaulterEvaluationDto evaluateDefaulter(BigDecimal attendancePct, int dayCheckpoint, BigDecimal medicalLeavePct) {
        if (attendancePct == null) {
            attendancePct = BigDecimal.ZERO.setScale(2, RoundingMode.DOWN);
        } else {
            attendancePct = attendancePct.setScale(2, RoundingMode.DOWN);
        }

        BigDecimal effectivePct = attendancePct;

        // Mumbai University 15% medical grace cap: raw attendance must be >= 60.00%
        if (attendancePct.compareTo(new BigDecimal("60.00")) >= 0 && medicalLeavePct != null && medicalLeavePct.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal allowedMedical = medicalLeavePct.min(new BigDecimal("15.00")).setScale(2, RoundingMode.DOWN);
            effectivePct = attendancePct.add(allowedMedical).min(new BigDecimal("100.00")).setScale(2, RoundingMode.DOWN);
        }

        boolean isDefaulter = effectivePct.compareTo(new BigDecimal("75.00")) < 0;
        String tier = null;
        List<String> actions = new ArrayList<>();

        if (isDefaulter) {
            if (dayCheckpoint >= 90) {
                tier = "D3";
                actions = List.of("DETENTION_HEARING", "LOCK_EXAM_HALL_TICKET", "REQUIRE_HOD_UNDERTAKING");
            } else if (dayCheckpoint >= 60) {
                tier = "D2";
                actions = List.of("COLLEGIATE_WARNING", "DISPATCH_PARENT_INTIMATION");
            } else if (dayCheckpoint >= 30) {
                tier = "D1";
                actions = List.of("STUDENT_IN_APP_WARNING", "MENTOR_DASHBOARD_FLAG");
            }
        }

        return DefaulterEvaluationDto.builder()
                .attendancePct(attendancePct)
                .effectivePct(effectivePct)
                .isDefaulter(isDefaulter)
                .tier(tier)
                .actions(actions)
                .build();
    }

    public DefaulterEvaluationDto evaluateDefaulter(BigDecimal attendancePct, int dayCheckpoint) {
        return evaluateDefaulter(attendancePct, dayCheckpoint, BigDecimal.ZERO);
    }

    public DefaulterEvaluationDto evaluateDefaulter(double attendancePct, int dayCheckpoint) {
        return evaluateDefaulter(BigDecimal.valueOf(attendancePct), dayCheckpoint, BigDecimal.ZERO);
    }

    public DefaulterEvaluationDto evaluateDefaulter(double attendancePct, int dayCheckpoint, double medicalLeavePct) {
        return evaluateDefaulter(BigDecimal.valueOf(attendancePct), dayCheckpoint, BigDecimal.valueOf(medicalLeavePct));
    }

    /**
     * Locks examination hall ticket for student entering Tier D3 detention.
     */
    @Transactional
    public void lockHallTicketForD3(UUID studentId, String reason) {
        Optional<HallTicket> optTicket = hallTicketRepository.findByStudentId(studentId);
        if (optTicket.isPresent()) {
            HallTicket ticket = optTicket.get();
            ticket.setLocked(true);
            ticket.setLockReason(reason != null ? reason : "DEFAULTER_TIER_D3_ATTENDANCE_DEFICIT");
            hallTicketRepository.save(ticket);
            log.warn("Hall ticket locked for student [{}] due to D3 defaulter status: {}", studentId, reason);
        } else {
            HallTicket newTicket = HallTicket.builder()
                    .studentId(studentId)
                    .semester(1)
                    .academicYear("2026-27")
                    .isLocked(true)
                    .lockReason(reason != null ? reason : "DEFAULTER_TIER_D3_ATTENDANCE_DEFICIT")
                    .build();
            hallTicketRepository.save(newTicket);
            log.warn("Created locked hall ticket for student [{}] due to D3 defaulter status", studentId);
        }
    }
}
