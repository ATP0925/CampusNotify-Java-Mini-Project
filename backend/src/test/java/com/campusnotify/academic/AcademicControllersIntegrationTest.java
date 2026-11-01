package com.campusnotify.academic;

import com.campusnotify.academic.controller.AcademicCoPoController.CoAttainmentRequest;
import com.campusnotify.academic.controller.AcademicSubstitutionController.EligibleSubstituteRequest;
import com.campusnotify.academic.dto.*;
import com.campusnotify.academic.service.ChaumianFeedbackService;
import com.campusnotify.academic.service.LectureSubstitutionService;
import com.campusnotify.academic.service.LectureSubstitutionService.InMemorySwap;
import com.campusnotify.dto.LoginRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AcademicControllersIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ChaumianFeedbackService chaumianFeedbackService;

    @Autowired
    private LectureSubstitutionService lectureSubstitutionService;

    private String authToken;

    @BeforeEach
    void setUp() throws Exception {
        LoginRequest adminLogin = LoginRequest.builder()
                .username("admin")
                .password("Admin@12345")
                .build();

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode json = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        this.authToken = json.get("data").get("accessToken").asText();
    }

    // ==========================================
    // 1. Attendance API (/api/academic/attendance)
    // ==========================================
    @Test
    @DisplayName("API: GET /api/academic/attendance/calculate returns strictly truncated percentage")
    void testAttendanceCalculateApi() throws Exception {
        mockMvc.perform(get("/api/academic/attendance/calculate")
                        .param("attended", "59")
                        .param("conducted", "79")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data").value(74.68));
    }

    @Test
    @DisplayName("API: GET /api/academic/attendance/summary returns summary DTO")
    void testAttendanceSummaryApi() throws Exception {
        UUID studentId = UUID.randomUUID();
        mockMvc.perform(get("/api/academic/attendance/summary")
                        .param("studentId", studentId.toString())
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.studentId").value(studentId.toString()))
                .andExpect(jsonPath("$.data.isDefaulter").value(true));
    }

    @Test
    @DisplayName("API: POST /api/academic/attendance/aggregate computes overall percentage")
    void testAttendanceAggregateApi() throws Exception {
        Map<String, Long> payload = Map.of("totalAttended", 150L, "totalConducted", 200L);
        mockMvc.perform(post("/api/academic/attendance/aggregate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload))
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data").value(75.00));
    }

    // ==========================================
    // 2. Term Work API (/api/academic/termwork)
    // ==========================================
    @Test
    @DisplayName("API: POST /api/academic/termwork/calculate computes 25-mark TW formula")
    void testTermWorkCalculatePostApi() throws Exception {
        TermWorkRequestDto req = TermWorkRequestDto.builder()
                .attendancePct(new BigDecimal("92.00"))
                .practicalMarks(List.of(new BigDecimal("10.00"), new BigDecimal("10.00")))
                .vivaMark(new BigDecimal("5.00"))
                .build();

        mockMvc.perform(post("/api/academic/termwork/calculate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.attendanceMark").value(5.0))
                .andExpect(jsonPath("$.data.labMark").value(15.0))
                .andExpect(jsonPath("$.data.vivaMark").value(5.0))
                .andExpect(jsonPath("$.data.totalTW").value(25.0));
    }

    @Test
    @DisplayName("API: GET /api/academic/termwork/calculate retrieves or computes marks")
    void testTermWorkCalculateGetApi() throws Exception {
        UUID studentId = UUID.randomUUID();
        mockMvc.perform(get("/api/academic/termwork/calculate")
                        .param("studentId", studentId.toString())
                        .param("subjectId", "CS401")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.totalTW").isNumber());
    }

    // ==========================================
    // 3. Defaulter API (/api/academic/defaulters)
    // ==========================================
    @Test
    @DisplayName("API: GET /api/academic/defaulters/evaluate evaluates D1-D3 pipeline")
    void testDefaultersEvaluateApi() throws Exception {
        mockMvc.perform(get("/api/academic/defaulters/evaluate")
                        .param("attendance", "68.00")
                        .param("dayCheckpoint", "60")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.isDefaulter").value(true))
                .andExpect(jsonPath("$.data.tier").value("D2"))
                .andExpect(jsonPath("$.data.actions[1]").value("DISPATCH_PARENT_INTIMATION"));
    }

    @Test
    @DisplayName("API: POST /api/academic/defaulters/lock-hall-ticket locks hall ticket")
    void testLockHallTicketApi() throws Exception {
        UUID studentId = UUID.randomUUID();
        Map<String, Object> payload = Map.of(
                "studentId", studentId.toString(),
                "reason", "ATTENDANCE_DEFICIT_D3"
        );
        mockMvc.perform(post("/api/academic/defaulters/lock-hall-ticket")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload))
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }

    // ==========================================
    // 4. Substitution API (/api/academic/substitutions)
    // ==========================================
    @Test
    @DisplayName("API: Substitution workflow (eligible -> request -> accept -> approve)")
    void testSubstitutionFullWorkflowApi() throws Exception {
        // 1. Eligible
        TimetableSlotDto slot = TimetableSlotDto.builder().id("slot_1").dept("IT").subject("Java").build();
        FacultyCandidateDto f1 = FacultyCandidateDto.builder().id("fac_1").dept("IT").competencies(List.of("Java")).busySlotIds(List.of()).build();
        EligibleSubstituteRequest req = EligibleSubstituteRequest.builder().slot(slot).facultyList(List.of(f1)).build();

        mockMvc.perform(post("/api/academic/substitutions/eligible")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value("fac_1"));

        // 2. Request
        SwapRequestDto swapReq = SwapRequestDto.builder()
                .slotId("slot_1")
                .requestingFacultyId("fac_orig")
                .substituteFacultyId("fac_1")
                .reason("Medical Leave")
                .build();

        MvcResult swapRes = mockMvc.perform(post("/api/academic/substitutions/request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(swapReq))
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PENDING_SUBSTITUTE_ACCEPTANCE"))
                .andReturn();

        String swapId = objectMapper.readTree(swapRes.getResponse().getContentAsString()).get("data").get("id").asText();

        // 3. Accept
        mockMvc.perform(put("/api/academic/substitutions/" + swapId + "/accept")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACCEPTED_BY_SUBSTITUTE"));

        // 4. Approve HOD
        mockMvc.perform(put("/api/academic/substitutions/" + swapId + "/approve-hod")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"hodId\":\"hod_it\"}")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.swap.status").value("APPROVED_BY_HOD"))
                .andExpect(jsonPath("$.data.triggerCachePurge").value(true));
    }

    // ==========================================
    // 5. CO-PO Attainment API (/api/academic/copo)
    // ==========================================
    @Test
    @DisplayName("API: POST /api/academic/copo/co-attainment computes NBA attainment level")
    void testCoAttainmentApi() throws Exception {
        CoAttainmentRequest req = CoAttainmentRequest.builder()
                .scores(List.of(
                        StudentQuestionScoreDto.builder().score(new BigDecimal("8.00")).maxScore(new BigDecimal("10.00")).build(),
                        StudentQuestionScoreDto.builder().score(new BigDecimal("7.00")).maxScore(new BigDecimal("10.00")).build()
                ))
                .thresholdPct(new BigDecimal("60.00"))
                .build();

        mockMvc.perform(post("/api/academic/copo/co-attainment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.attainmentLevel").value(3))
                .andExpect(jsonPath("$.data.percentageMeetingThreshold").value(100.00));
    }

    // ==========================================
    // 6. No-Dues DAG API (/api/academic/nodues)
    // ==========================================
    @Test
    @DisplayName("API: No-Dues DAG (initiate -> status -> clear-node -> detect-cycle)")
    void testNoDuesWorkflowApi() throws Exception {
        String studentId = "student_api_test";

        // 1. Initiate
        mockMvc.perform(post("/api/academic/nodues/initiate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"studentId\":\"" + studentId + "\"}")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.nodeStatus.LIBRARY").value("PENDING"))
                .andExpect(jsonPath("$.data.nodeStatus.HOD").value("LOCKED"));

        // 2. Status
        mockMvc.perform(get("/api/academic/nodues/status")
                        .param("studentId", studentId)
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.studentId").value(studentId));

        // 3. Clear Node
        NoDuesClearNodeRequestDto clearReq = NoDuesClearNodeRequestDto.builder()
                .studentId(studentId)
                .nodeCode("LIBRARY")
                .clearedBy("lib_head")
                .transactionRef("TXN_123")
                .build();

        mockMvc.perform(post("/api/academic/nodues/clear-node")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(clearReq))
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.nodeStatus.LIBRARY").value("CLEARED"));

        // 4. Detect cycle
        DagCycleRequestDto cycleReq = DagCycleRequestDto.builder()
                .nodes(List.of("A", "B"))
                .edges(List.of(List.of("A", "B"), List.of("B", "A")))
                .build();

        mockMvc.perform(post("/api/academic/nodues/detect-cycle")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cycleReq))
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(true));
    }

    // ==========================================
    // 7. Gale-Shapley Allocation API (/api/academic/allocation)
    // ==========================================
    @Test
    @DisplayName("API: POST /api/academic/allocation/run-matching runs stable matching")
    void testGaleShapleyApi() throws Exception {
        GaleShapleyRequestDto req = GaleShapleyRequestDto.builder()
                .groups(List.of(
                        ProjectGroupDto.builder().id("g1").preferences(List.of("guide_A")).cgpa(new BigDecimal("9.0")).build()
                ))
                .guides(List.of(
                        FacultyGuideDto.builder().id("guide_A").capacity(1).build()
                ))
                .build();

        mockMvc.perform(post("/api/academic/allocation/run-matching")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.guide_A[0]").value("g1"));
    }

    // ==========================================
    // 8. Chaumian Feedback API (/api/academic/feedback)
    // ==========================================
    @Test
    @DisplayName("API: Chaumian Blind Signature flow (blind-token -> blind-submit)")
    void testChaumianFeedbackApi() throws Exception {
        // Blinding on client side
        BigInteger msgHash = new BigInteger("888");
        BigInteger r = new BigInteger("29");
        BigInteger blinded = chaumianFeedbackService.blindMessage(msgHash, r);

        // 1. Sign blinded token via registrar API
        BlindTokenSignRequestDto signReq = BlindTokenSignRequestDto.builder()
                .blindedToken(blinded.toString())
                .build();

        MvcResult signRes = mockMvc.perform(post("/api/academic/feedback/blind-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signReq))
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andReturn();

        String sigStr = objectMapper.readTree(signRes.getResponse().getContentAsString()).get("data").asText();
        BigInteger blindedSig = new BigInteger(sigStr);

        // 2. Unblind on client side
        BigInteger unblindedSig = chaumianFeedbackService.unblindSignature(blindedSig, r);

        // 3. Submit anonymous feedback with unblinded signature
        String tokenUuid = "token_api_" + UUID.randomUUID();
        UUID facultyId = UUID.randomUUID();
        AnonymousFeedbackRequestDto fbReq = AnonymousFeedbackRequestDto.builder()
                .tokenUuid(tokenUuid)
                .messageHash(msgHash.toString())
                .signature(unblindedSig.toString())
                .facultyId(facultyId)
                .rating(5)
                .comment("Outstanding pedagogy")
                .build();

        mockMvc.perform(post("/api/academic/feedback/blind-submit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(fbReq))
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.rating").value(5))
                .andExpect(jsonPath("$.data.comment").value("Outstanding pedagogy"));

        // 4. Verify token-status is spent
        mockMvc.perform(get("/api/academic/feedback/token-status")
                        .param("tokenUuid", tokenUuid)
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.spent").value(true));
    }
}
