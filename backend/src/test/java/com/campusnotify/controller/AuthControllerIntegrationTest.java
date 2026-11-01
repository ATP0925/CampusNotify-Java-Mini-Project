package com.campusnotify.controller;

import com.campusnotify.dto.LoginRequest;
import com.campusnotify.dto.RegisterRequest;
import com.campusnotify.dto.UpdateUserRequest;
import com.campusnotify.entity.RoleType;
import com.campusnotify.repository.UserRepository;
import com.campusnotify.security.TokenBlacklistService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Test
    void testFullAuthLifecycleAndRoleSecurity() throws Exception {
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
        String username = "student_" + uniqueSuffix;
        String email = username + "@campusnotify.edu";
        String prn = "PRN-" + uniqueSuffix;

        // 1. Register Student
        RegisterRequest registerReq = RegisterRequest.builder()
                .username(username)
                .email(email)
                .password("SecurePass@123")
                .fullName("Aarav Patel")
                .department("IT")
                .prn(prn)
                .rollNo("25")
                .phone("9820012345")
                .parentPhone("9820098765")
                .roles(Set.of(RoleType.STUDENT))
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.username").value(username))
                .andExpect(jsonPath("$.data.parentPhoneVerified").value(false));

        // 2. Login
        LoginRequest loginReq = LoginRequest.builder()
                .username(username)
                .password("SecurePass@123")
                .build();

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty())
                .andReturn();

        JsonNode loginJson = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String accessToken = loginJson.get("data").get("accessToken").asText();
        String refreshToken = loginJson.get("data").get("refreshToken").asText();
        String studentUserId = loginJson.get("data").get("user").get("id").asText();

        // 3. Access /api/users/me with Bearer token
        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.username").value(username))
                .andExpect(jsonPath("$.data.prn").value(prn));

        // 4. Layer 5 Anti-Fraud: Student attempts to hijack parent phone -> 403 FORBIDDEN
        UpdateUserRequest hijackReq = UpdateUserRequest.builder()
                .parentPhone("9898989898")
                .build();

        mockMvc.perform(put("/api/users/" + studentUserId)
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(hijackReq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value("ERROR"))
                .andExpect(jsonPath("$.error.code").value("FORBIDDEN"));

        // 5. Logout and verify token revocation (L1 Blacklist)
        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));

        // 6. Access /api/users/me with revoked token -> 401 UNAUTHORIZED
        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testLoginWithAdminCredentials() throws Exception {
        LoginRequest adminLogin = LoginRequest.builder()
                .username("admin")
                .password("Admin@12345")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.user.username").value("admin"));
    }
}
