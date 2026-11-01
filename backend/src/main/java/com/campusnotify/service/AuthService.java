package com.campusnotify.service;

import com.campusnotify.dto.*;
import com.campusnotify.entity.RefreshToken;
import com.campusnotify.entity.Role;
import com.campusnotify.entity.RoleType;
import com.campusnotify.entity.User;
import com.campusnotify.repository.RefreshTokenRepository;
import com.campusnotify.repository.RoleRepository;
import com.campusnotify.repository.UserRepository;
import com.campusnotify.security.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenBlacklistService tokenBlacklistService;
    private final DynamicTotpService dynamicTotpService;
    private final ReplicaLagCacheService replicaLagCacheService;
    private final TlsFingerprintValidator tlsFingerprintValidator;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            TokenBlacklistService tokenBlacklistService,
            DynamicTotpService dynamicTotpService,
            ReplicaLagCacheService replicaLagCacheService,
            TlsFingerprintValidator tlsFingerprintValidator) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.tokenBlacklistService = tokenBlacklistService;
        this.dynamicTotpService = dynamicTotpService;
        this.replicaLagCacheService = replicaLagCacheService;
        this.tlsFingerprintValidator = tlsFingerprintValidator;
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Validate JA4 TLS fingerprint if provided (L3)
        if (request.getJa4Fingerprint() != null) {
            var tlsResult = tlsFingerprintValidator.validateJa4Fingerprint(request.getJa4Fingerprint());
            if (!tlsResult.valid()) {
                throw new BadCredentialsException("TLS security check failed: " + tlsResult.reason());
            }
        }

        User user = userRepository.findByUsername(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        // Validate hardware attestation if registered (L3)
        if (user.getHardwareDeviceId() != null && request.getHardwareDeviceId() != null) {
            if (!user.getHardwareDeviceId().equalsIgnoreCase(request.getHardwareDeviceId())) {
                user.setProxyStrikeCount(user.getProxyStrikeCount() + 1);
                userRepository.save(user);
                throw new BadCredentialsException("Hardware device mismatch: Account is bound to device " + user.getHardwareDeviceId());
            }
        }

        // Check if MFA is enabled for this user (L4)
        if (user.isMfaEnabled()) {
            return AuthResponse.builder()
                    .mfaRequired(true)
                    .user(toSummaryDto(user))
                    .build();
        }

        return issueAuthTokens(user);
    }

    @Transactional
    public AuthResponse verifyMfa(MfaVerifyRequest request) {
        User user;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new BadCredentialsException("User not found"));
        } else if (request.getUsername() != null) {
            user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new BadCredentialsException("User not found"));
        } else {
            throw new IllegalArgumentException("UserId or username required for MFA verification");
        }

        if (user.getMfaSecret() == null || user.getMfaSecret().isBlank()) {
            throw new IllegalStateException("MFA is not configured for this user");
        }

        boolean valid = dynamicTotpService.verifyTotp(user.getMfaSecret(), request.getTotpCode());
        if (!valid) {
            throw new BadCredentialsException("Invalid or expired TOTP code");
        }

        return issueAuthTokens(user);
    }

    @Transactional
    public MfaSetupResponse setupMfa(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        String secret = dynamicTotpService.generateSecret();
        user.setMfaSecret(secret);
        user.setMfaEnabled(true);
        userRepository.save(user);

        String qrPayload = dynamicTotpService.generateQrPayload(secret, user.getId());
        return MfaSetupResponse.builder()
                .secret(secret)
                .qrPayload(qrPayload)
                .timeStepSeconds(dynamicTotpService.getTimeStepSeconds())
                .build();
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        if (storedToken.isRevoked() || storedToken.isExpired()) {
            throw new BadCredentialsException("Refresh token is expired or revoked");
        }

        User user = userRepository.findById(storedToken.getUserId())
                .orElseThrow(() -> new BadCredentialsException("User associated with token not found"));

        // Issue new access token and rotate refresh token
        return issueAuthTokens(user);
    }

    @Transactional
    public void logout(String bearerToken) {
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            if (jwtTokenProvider.validateToken(token)) {
                String jti = jwtTokenProvider.getJti(token);
                long remainingTtlSeconds = jwtTokenProvider.getRemainingTtlMs(token) / 1000;
                // Blacklist token in Redis / memory (L1)
                tokenBlacklistService.blacklistToken(jti, remainingTtlSeconds);

                UUID userId = jwtTokenProvider.getUserId(token);
                refreshTokenRepository.deleteByUserId(userId);
                log.info("User [{}] logged out, access token JTI [{}] blacklisted", userId, jti);
            }
        }
    }

    @Transactional
    public UserSummaryDto register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }
        if (request.getPrn() != null && !request.getPrn().isBlank() && userRepository.existsByPrn(request.getPrn())) {
            throw new IllegalArgumentException("PRN is already registered");
        }

        Set<Role> roles = new HashSet<>();
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            for (RoleType roleType : request.getRoles()) {
                Role role = roleRepository.findByName(roleType)
                        .orElseGet(() -> roleRepository.save(new Role(roleType)));
                roles.add(role);
            }
        } else {
            Role defaultRole = roleRepository.findByName(RoleType.STUDENT)
                    .orElseGet(() -> roleRepository.save(new Role(RoleType.STUDENT)));
            roles.add(defaultRole);
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .department(request.getDepartment())
                .prn(request.getPrn())
                .rollNo(request.getRollNo())
                .phone(request.getPhone())
                .parentPhone(request.getParentPhone())
                .parentPhoneVerified(false) // Requires administrative verification
                .hardwareDeviceId(request.getHardwareDeviceId())
                .hardwareDeviceAttestation(request.getAttestationProof())
                .roles(roles)
                .build();

        User saved = userRepository.save(user);
        return toSummaryDto(saved);
    }

    private AuthResponse issueAuthTokens(User user) {
        List<String> roleNames = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getUsername(), roleNames, user.getDepartment(), user.getPrn());

        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());
        String refreshJti = jwtTokenProvider.getJti(refreshToken);

        // Store refresh token
        RefreshToken tokenEntity = RefreshToken.builder()
                .token(refreshToken)
                .userId(user.getId())
                .expiryDate(Instant.now().plusMillis(604800000))
                .jti(refreshJti)
                .revoked(false)
                .build();
        refreshTokenRepository.save(tokenEntity);

        // Register write fence for read-your-own-writes session consistency (L2)
        replicaLagCacheService.registerWriteFence(user.getId(), "auth:session", user.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresInMs(jwtTokenProvider.getAccessTokenExpirationMs())
                .mfaRequired(false)
                .user(toSummaryDto(user))
                .build();
    }

    public UserSummaryDto toSummaryDto(User user) {
        List<String> roleNames = user.getRoles() != null
                ? user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList())
                : List.of();

        return UserSummaryDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .department(user.getDepartment())
                .prn(user.getPrn())
                .rollNo(user.getRollNo())
                .phone(user.getPhone())
                .parentPhone(user.getParentPhone())
                .parentPhoneVerified(user.isParentPhoneVerified())
                .hardwareDeviceId(user.getHardwareDeviceId())
                .mfaEnabled(user.isMfaEnabled())
                .roles(roleNames)
                .build();
    }
}
