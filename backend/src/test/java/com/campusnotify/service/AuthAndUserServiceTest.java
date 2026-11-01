package com.campusnotify.service;

import com.campusnotify.dto.*;
import com.campusnotify.entity.Role;
import com.campusnotify.entity.RoleType;
import com.campusnotify.entity.User;
import com.campusnotify.repository.RefreshTokenRepository;
import com.campusnotify.repository.RoleRepository;
import com.campusnotify.repository.UserRepository;
import com.campusnotify.security.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthAndUserServiceTest {

    private UserRepository userRepository;
    private RoleRepository roleRepository;
    private RefreshTokenRepository refreshTokenRepository;
    private PasswordEncoder passwordEncoder;
    private JwtTokenProvider jwtTokenProvider;
    private RedisTokenBlacklistService tokenBlacklistService;
    private DynamicTotpService dynamicTotpService;
    private ReplicaLagCacheService replicaLagCacheService;
    private TlsFingerprintValidator tlsFingerprintValidator;

    private AuthService authService;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        roleRepository = mock(RoleRepository.class);
        refreshTokenRepository = mock(RefreshTokenRepository.class);
        passwordEncoder = new BCryptPasswordEncoder();
        jwtTokenProvider = new JwtTokenProvider(
                "campusnotify-super-secret-key-that-is-at-least-256-bits-long-for-hmac-sha256-compliance",
                3600000L, 604800000L, 900000L);
        tokenBlacklistService = new RedisTokenBlacklistService(null);
        dynamicTotpService = new DynamicTotpService(15L, 1);
        replicaLagCacheService = new ReplicaLagCacheService(null, 5L);
        tlsFingerprintValidator = new TlsFingerprintValidator();

        authService = new AuthService(
                userRepository,
                roleRepository,
                refreshTokenRepository,
                passwordEncoder,
                jwtTokenProvider,
                tokenBlacklistService,
                dynamicTotpService,
                replicaLagCacheService,
                tlsFingerprintValidator
        );

        userService = new UserService(
                userRepository,
                authService,
                replicaLagCacheService,
                tlsFingerprintValidator
        );
    }

    @Test
    void testRegisterAndLoginWorkflow() {
        RegisterRequest registerReq = RegisterRequest.builder()
                .username("rohit_sharma")
                .email("rohit@campusnotify.edu")
                .password("Password@123")
                .fullName("Rohit Sharma")
                .department("IT")
                .prn("VU4F2526072")
                .roles(Set.of(RoleType.STUDENT))
                .build();

        when(userRepository.existsByUsername("rohit_sharma")).thenReturn(false);
        when(userRepository.existsByEmail("rohit@campusnotify.edu")).thenReturn(false);
        when(roleRepository.findByName(RoleType.STUDENT)).thenReturn(Optional.of(new Role(RoleType.STUDENT)));

        User savedUser = User.builder()
                .username(registerReq.getUsername())
                .email(registerReq.getEmail())
                .passwordHash(passwordEncoder.encode(registerReq.getPassword()))
                .fullName(registerReq.getFullName())
                .department(registerReq.getDepartment())
                .prn(registerReq.getPrn())
                .roles(Set.of(new Role(RoleType.STUDENT)))
                .build();
        savedUser.setId(UUID.randomUUID());

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserSummaryDto userSummary = authService.register(registerReq);
        assertNotNull(userSummary);
        assertEquals("rohit_sharma", userSummary.getUsername());

        // Now test Login
        when(userRepository.findByUsername("rohit_sharma")).thenReturn(Optional.of(savedUser));

        LoginRequest loginReq = LoginRequest.builder()
                .username("rohit_sharma")
                .password("Password@123")
                .build();

        AuthResponse authRes = authService.login(loginReq);
        assertNotNull(authRes);
        assertNotNull(authRes.getAccessToken());
        assertNotNull(authRes.getRefreshToken());
        assertFalse(authRes.isMfaRequired());
        assertEquals("Bearer", authRes.getTokenType());
    }

    @Test
    void testLoginWithInvalidPasswordFails() {
        User user = User.builder()
                .username("virat_kohli")
                .passwordHash(passwordEncoder.encode("CorrectPassword123"))
                .roles(Set.of(new Role(RoleType.STUDENT)))
                .build();
        user.setId(UUID.randomUUID());

        when(userRepository.findByUsername("virat_kohli")).thenReturn(Optional.of(user));

        LoginRequest req = LoginRequest.builder()
                .username("virat_kohli")
                .password("WrongPassword")
                .build();

        assertThrows(BadCredentialsException.class, () -> authService.login(req));
    }

    @Test
    void testParentPhoneHijackProtection() {
        UUID studentId = UUID.randomUUID();
        User student = User.builder()
                .username("student_1")
                .fullName("Student One")
                .parentPhone("9820011111")
                .parentPhoneVerified(true)
                .build();
        student.setId(studentId);

        when(userRepository.findById(studentId)).thenReturn(Optional.of(student));

        UpdateUserRequest updateReq = UpdateUserRequest.builder()
                .parentPhone("9820099999") // Student trying to hijack parent phone with second SIM
                .build();

        // When a non-admin attempts this, it MUST throw AccessDeniedException
        assertThrows(AccessDeniedException.class, () -> {
            userService.updateUser(studentId, updateReq, false); // isAdmin = false
        });

        // When admin attempts this with in-person verification, it succeeds
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        UserSummaryDto updatedByAdmin = userService.updateUser(studentId, updateReq, true); // isAdmin = true
        assertEquals("9820099999", updatedByAdmin.getParentPhone());
    }
}
