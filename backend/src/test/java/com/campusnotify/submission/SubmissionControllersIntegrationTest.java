package com.campusnotify.submission;

import com.campusnotify.dto.LoginRequest;
import com.campusnotify.proctoring.dto.ProctoringEventDto;
import com.campusnotify.proctoring.dto.TypingDynamicsRequestDto;
import com.campusnotify.submission.dto.*;
import com.campusnotify.viva.dto.VivaEvaluationRequestDto;
import com.campusnotify.viva.dto.VivaGenerateQuestionsRequestDto;
import com.campusnotify.viva.dto.VivaRubricDto;
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
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class SubmissionControllersIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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
    // 1. Practicals API (/api/practicals/**)
    // ==========================================
    @Test
    @DisplayName("API: POST /api/practicals creates a practical and GET /api/practicals lists it")
    void testCreateAndListPracticalsApi() throws Exception {
        CreatePracticalRequest req = CreatePracticalRequest.builder()
                .title("Integration Practical 1")
                .description("B-Tree Balancing in Java")
                .subjectCode("CS301")
                .practicalNo(1)
                .maxMarks(BigDecimal.valueOf(10.00))
                .department("IT")
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/practicals")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.title").value("Integration Practical 1"))
                .andExpect(jsonPath("$.data.status").value("PUBLISHED"))
                .andReturn();

        JsonNode createdJson = objectMapper.readTree(createResult.getResponse().getContentAsString());
        String practicalId = createdJson.get("data").get("id").asText();

        // GET by ID
        mockMvc.perform(get("/api/practicals/" + practicalId)
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(practicalId));

        // GET Parameterized Spec
        mockMvc.perform(get("/api/practicals/" + practicalId + "/parameterized-spec")
                        .param("rollNo", "72")
                        .param("prn", "PRN_INTEG_100")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.arraySizeN").value(72))
                .andExpect(jsonPath("$.data.watermarkEmbedded").value(true));
    }

    // ==========================================
    // 2. Submissions API (/api/submissions/**)
    // ==========================================
    @Test
    @DisplayName("API: POST /api/submissions submits code and GET /api/submissions/{id} retrieves it")
    void testSubmitPracticalAndRetrieveApi() throws Exception {
        UUID studentId = UUID.randomUUID();

        // Create practical first
        CreatePracticalRequest pReq = CreatePracticalRequest.builder()
                .title("Exp OS 1")
                .subjectCode("OS")
                .build();

        MvcResult pRes = mockMvc.perform(post("/api/practicals")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pReq)))
                .andExpect(status().isOk())
                .andReturn();

        String pId = objectMapper.readTree(pRes.getResponse().getContentAsString()).get("data").get("id").asText();

        SubmissionRequest sReq = SubmissionRequest.builder()
                .practicalId(UUID.fromString(pId))
                .studentId(studentId)
                .content("public class Solution { public static void main(String[] args) {} }")
                .language("java")
                .executionStatus("SUCCESS")
                .exitCode(0)
                .build();

        MvcResult sRes = mockMvc.perform(post("/api/submissions")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.status").value("SUBMITTED"))
                .andExpect(jsonPath("$.data.submissionHash").isNotEmpty())
                .andReturn();

        String subId = objectMapper.readTree(sRes.getResponse().getContentAsString()).get("data").get("id").asText();

        mockMvc.perform(get("/api/submissions/" + subId)
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(subId));
    }

    @Test
    @DisplayName("API: POST /api/submissions/draft-sync syncs CRDT draft")
    void testDraftSyncApi() throws Exception {
        DraftSyncRequestDto draft = DraftSyncRequestDto.builder()
                .practicalId(UUID.randomUUID())
                .studentId(UUID.randomUUID())
                .walVersion(10)
                .bufferContent("let x = 100;")
                .cursorPosition("{\"lineNumber\":1,\"column\":1}")
                .checksum("chk_123")
                .build();

        mockMvc.perform(post("/api/submissions/draft-sync")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(draft)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.walVersion").value(10))
                .andExpect(jsonPath("$.data.bufferContent").value("let x = 100;"));
    }

    // ==========================================
    // 3. Proctoring API (/api/proctoring/**)
    // ==========================================
    @Test
    @DisplayName("API: POST /api/proctoring/evaluate-typing clamps velocity")
    void testProctoringEvaluateTypingApi() throws Exception {
        TypingDynamicsRequestDto req = TypingDynamicsRequestDto.builder()
                .deltaChars(200)
                .deltaMs(50)
                .build();

        mockMvc.perform(post("/api/proctoring/evaluate-typing")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.violation").value(true))
                .andExpect(jsonPath("$.data.type").value("BURST_INJECTION_DETECTED"));
    }

    @Test
    @DisplayName("API: POST /api/proctoring/event logs violation event")
    void testProctoringLogEventApi() throws Exception {
        UUID subId = UUID.randomUUID();
        UUID studId = UUID.randomUUID();

        ProctoringEventDto event = ProctoringEventDto.builder()
                .submissionId(subId)
                .studentId(studId)
                .violationType("FOCUS_LOST")
                .timeDeltaMs(7500)
                .build();

        mockMvc.perform(post("/api/proctoring/event")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(event)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.violationType").value("FOCUS_LOST"))
                .andExpect(jsonPath("$.data.timeDeltaMs").value(7500));
    }

    // ==========================================
    // 4. Viva Voce API (/api/viva/**)
    // ==========================================
    @Test
    @DisplayName("API: POST /api/viva/evaluate scores viva response")
    void testVivaEvaluateApi() throws Exception {
        VivaEvaluationRequestDto req = VivaEvaluationRequestDto.builder()
                .transcript("We used quicksort for O(N log N) average time and in-place partitioning.")
                .rubric(VivaRubricDto.builder()
                        .techDepth(8.0)
                        .problemSolving(9.0)
                        .codeUnderstanding(8.0)
                        .communication(7.0)
                        .build())
                .build();

        mockMvc.perform(post("/api/viva/evaluate")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.compositeScore10").value(8.20))
                .andExpect(jsonPath("$.data.marksViva5").value(4.10))
                .andExpect(jsonPath("$.data.attainmentLevel").value(3));
    }

    @Test
    @DisplayName("API: POST /api/viva/generate-questions produces progressive question list")
    void testVivaGenerateQuestionsApi() throws Exception {
        VivaGenerateQuestionsRequestDto req = VivaGenerateQuestionsRequestDto.builder()
                .topic("Graph Dijkstra Algorithm")
                .questionCount(4)
                .build();

        mockMvc.perform(post("/api/viva/generate-questions")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(4))
                .andExpect(jsonPath("$.data[0].category").value("SYNTAX_APPROACH"));
    }

    // ==========================================
    // 5. Faculty Submission API (/api/faculty/submissions/**)
    // ==========================================
    @Test
    @DisplayName("API: POST /api/faculty/submissions/bulk-grade applies batch grades")
    void testFacultyBulkGradeApi() throws Exception {
        List<BulkGradeItemDto> items = List.of(
                BulkGradeItemDto.builder().submissionId("sub_1").marks(9.5).feedback("Well done").build(),
                BulkGradeItemDto.builder().submissionId("sub_2").marks(8.0).feedback("Good effort").build()
        );

        mockMvc.perform(post("/api/faculty/submissions/bulk-grade")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(items)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].marks").value(9.5))
                .andExpect(jsonPath("$.data[0].status").value("GRADED"));
    }

    @Test
    @DisplayName("API: POST /api/faculty/submissions/redo dispatches redo notification")
    void testFacultyRedoRequestApi() throws Exception {
        RedoRequestDto req = RedoRequestDto.builder()
                .submissionId("sub_redo_test")
                .reason("Need unit test coverage for edge cases")
                .build();

        mockMvc.perform(post("/api/faculty/submissions/redo")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.redoRequested").value(true))
                .andExpect(jsonPath("$.data.emailDispatched").value(true))
                .andExpect(jsonPath("$.data.reason").value("Need unit test coverage for edge cases"));
    }
}
