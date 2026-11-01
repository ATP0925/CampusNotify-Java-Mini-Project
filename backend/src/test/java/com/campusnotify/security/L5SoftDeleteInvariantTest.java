package com.campusnotify.security;

import com.campusnotify.entity.LabAsset;
import com.campusnotify.entity.User;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class L5SoftDeleteInvariantTest {

    @Test
    void testSoftDeleteInvariantsOnEntity() {
        LabAsset asset = LabAsset.builder()
                .assetCode("LAB-PC-01")
                .name("Dell OptiPlex 7090")
                .labRoom("Lab 203")
                .status("AVAILABLE")
                .build();

        assertFalse(asset.isArchived());
        assertNull(asset.getDeletedAt());

        // Perform soft delete
        asset.softDelete();

        assertTrue(asset.isArchived(), "Entity must be marked as archived");
        assertNotNull(asset.getDeletedAt(), "deletedAt timestamp must be populated");
        assertTrue(asset.getDeletedAt().isBefore(Instant.now().plusSeconds(1)));

        // Test restore
        asset.restore();
        assertFalse(asset.isArchived());
        assertNull(asset.getDeletedAt());
    }

    @Test
    void testUserSoftDeleteMaintainsHistoricalProfile() {
        User user = User.builder()
                .username("alumni_student")
                .email("alumni@campusnotify.edu")
                .passwordHash("hashed")
                .fullName("Alumni Student")
                .department("IT")
                .prn("VU4F2223001")
                .build();

        user.softDelete();
        assertTrue(user.isArchived());
        assertNotNull(user.getDeletedAt());
        assertEquals("VU4F2223001", user.getPrn(), "PRN and academic history must remain intact");
    }
}
