package com.campusnotify.service;

import com.campusnotify.dto.UpdateUserRequest;
import com.campusnotify.dto.UserSummaryDto;
import com.campusnotify.entity.User;
import com.campusnotify.repository.UserRepository;
import com.campusnotify.security.ReplicaLagCacheService;
import com.campusnotify.security.TlsFingerprintValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final AuthService authService;
    private final ReplicaLagCacheService replicaLagCacheService;
    private final TlsFingerprintValidator tlsFingerprintValidator;

    public UserService(
            UserRepository userRepository,
            AuthService authService,
            ReplicaLagCacheService replicaLagCacheService,
            TlsFingerprintValidator tlsFingerprintValidator) {
        this.userRepository = userRepository;
        this.authService = authService;
        this.replicaLagCacheService = replicaLagCacheService;
        this.tlsFingerprintValidator = tlsFingerprintValidator;
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getUserById(UUID id) {
        // L2: Read-Your-Own-Writes replica lag protection
        if (replicaLagCacheService.hasActiveWriteFence(id, "profile")) {
            log.debug("Read-Your-Own-Writes active for user profile [{}]", id);
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        return authService.toSummaryDto(user);
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username: " + username));
        return authService.toSummaryDto(user);
    }

    @Transactional(readOnly = true)
    public List<UserSummaryDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(authService::toSummaryDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserSummaryDto updateUser(UUID id, UpdateUserRequest request, boolean isAdmin) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        // Layer 5 Anti-Fraud Enforcement: Parent phone number hijack protection
        if (request.getParentPhone() != null && !request.getParentPhone().equals(user.getParentPhone())) {
            if (!isAdmin) {
                log.warn("Unauthorized attempt by non-admin to mutate parent phone number for user [{}]", id);
                throw new AccessDeniedException("Zero Self-Service Rights: Parent phone numbers cannot be changed by students. Physical in-person administrative approval is required.");
            }
            user.setParentPhone(request.getParentPhone());
        }

        if (request.getParentPhoneVerified() != null) {
            if (!isAdmin) {
                throw new AccessDeniedException("Parent phone verification status can only be updated by administrators.");
            }
            user.setParentPhoneVerified(request.getParentPhoneVerified());
        }

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        if (request.getRollNo() != null) {
            user.setRollNo(request.getRollNo());
        }

        if (request.getHardwareDeviceId() != null) {
            user.setHardwareDeviceId(request.getHardwareDeviceId());
        }

        if (request.getAttestationProof() != null) {
            user.setHardwareDeviceAttestation(request.getAttestationProof());
        }

        User saved = userRepository.save(user);

        // L2: Set write fence so subsequent reads immediately reflect updates
        replicaLagCacheService.registerWriteFence(id, "profile", saved.getFullName());

        return authService.toSummaryDto(saved);
    }

    @Transactional
    public UserSummaryDto bindHardwareDevice(UUID id, String hardwareDeviceId, String attestationProof) {
        if (!tlsFingerprintValidator.validateHardwareAttestation(hardwareDeviceId, attestationProof)) {
            throw new IllegalArgumentException("Invalid hardware enclave attestation proof");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        user.setHardwareDeviceId(hardwareDeviceId);
        user.setHardwareDeviceAttestation(attestationProof);
        User saved = userRepository.save(user);

        log.info("Bound hardware device [{}] to user [{}] with enclave attestation", hardwareDeviceId, id);
        return authService.toSummaryDto(saved);
    }

    @Transactional
    public void softDeleteUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        // L5 Soft-delete invariant: disallow hard delete
        user.softDelete();
        userRepository.save(user);
        log.info("Soft-deleted user [{}] with timestamp {}", id, user.getDeletedAt());
    }
}
