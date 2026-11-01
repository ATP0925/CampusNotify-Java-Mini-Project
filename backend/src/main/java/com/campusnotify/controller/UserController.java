package com.campusnotify.controller;

import com.campusnotify.dto.ApiResponse;
import com.campusnotify.dto.UpdateUserRequest;
import com.campusnotify.dto.UserSummaryDto;
import com.campusnotify.security.UserPrincipal;
import com.campusnotify.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserSummaryDto>> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("UNAUTHORIZED", "Authentication required"));
        }
        UserSummaryDto user = userService.getUserById(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'FACULTY') or #id == principal.id")
    public ResponseEntity<ApiResponse<UserSummaryDto>> getUserById(@PathVariable UUID id) {
        UserSummaryDto user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD')")
    public ResponseEntity<ApiResponse<List<UserSummaryDto>>> getAllUsers() {
        List<UserSummaryDto> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == principal.id")
    public ResponseEntity<ApiResponse<UserSummaryDto>> updateUser(
            @PathVariable UUID id,
            @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        boolean isAdmin = principal != null && principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        UserSummaryDto updated = userService.updateUser(id, request, isAdmin);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @PostMapping("/{id}/hardware-binding")
    @PreAuthorize("hasRole('ADMIN') or #id == principal.id")
    public ResponseEntity<ApiResponse<UserSummaryDto>> bindHardwareDevice(
            @PathVariable UUID id,
            @RequestParam String hardwareDeviceId,
            @RequestParam String attestationProof) {

        UserSummaryDto updated = userService.bindHardwareDevice(id, hardwareDeviceId, attestationProof);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable UUID id) {
        userService.softDeleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User successfully soft-deleted"));
    }
}
