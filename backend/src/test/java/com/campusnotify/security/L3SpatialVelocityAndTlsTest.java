package com.campusnotify.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class L3SpatialVelocityAndTlsTest {

    private SpatialVelocityFilter velocityFilter;
    private TlsFingerprintValidator tlsValidator;

    // PVPPCOE Sion Coordinates: 19.0475° N, 72.8710° E
    private final double campusLat = 19.0475;
    private final double campusLng = 72.8710;

    @BeforeEach
    void setUp() {
        velocityFilter = new SpatialVelocityFilter(35.0, 2.5);
        velocityFilter.clearHistory();
        tlsValidator = new TlsFingerprintValidator();
    }

    @Test
    void testHaversineDistanceAccuracy() {
        // PVPPCOE to Sion Station: ~1.2 km away (19.0400, 72.8620)
        double distance = velocityFilter.calculateHaversineDistance(campusLat, campusLng, 19.0400, 72.8620);
        assertTrue(distance > 1000 && distance < 1500, "Distance should be ~1.2 km, found: " + distance);
    }

    @Test
    void testGeofenceEnforcement() {
        // Point 20 meters away (inside 50m geofence)
        double insideLat = campusLat + 0.00015;
        double insideLng = campusLng + 0.00010;
        assertTrue(velocityFilter.isWithinGeofence(insideLat, insideLng, campusLat, campusLng, 50.0));

        // Point 500 meters away (outside geofence)
        double outsideLat = campusLat + 0.005;
        double outsideLng = campusLng + 0.005;
        assertFalse(velocityFilter.isWithinGeofence(outsideLat, outsideLng, campusLat, campusLng, 50.0));
    }

    @Test
    void testSpatialVelocityClamping() {
        UUID studentId = UUID.randomUUID();
        Instant t0 = Instant.now();

        // Initial scan at Sion Campus
        var res1 = velocityFilter.validateSpatialVelocity(studentId, campusLat, campusLng, t0);
        assertTrue(res1.valid());

        // Second scan 10 seconds later from Kurla (3 km away) -> Speed = 300 m/s > 35 m/s
        Instant t1 = t0.plusSeconds(10);
        double kurlaLat = 19.0700;
        double kurlaLng = 72.8800;
        var res2 = velocityFilter.validateSpatialVelocity(studentId, kurlaLat, kurlaLng, t1);

        assertFalse(res2.valid(), "Impossible travel speed must be rejected");
        assertTrue(res2.velocityMetersPerSec() > 35.0);
    }

    @Test
    void testBackpackMuleDetection() {
        UUID student1 = UUID.randomUUID();
        UUID student2 = UUID.randomUUID();
        String token = "TOTP-987654";
        String labBssid = "00:14:22:01:23:45";
        Instant now = Instant.now();

        // Student 1 scans from Lab 203 BSSID
        var muleRes1 = velocityFilter.checkMuleProxy(student1, token, "192.168.10.45", labBssid, now);
        assertFalse(muleRes1.muleDetected());

        // Student 2 scans 1.2s later from identical BSSID (Mule proxy with 2 phones in bag)
        Instant scan2 = now.plusMillis(1200);
        var muleRes2 = velocityFilter.checkMuleProxy(student2, token, "192.168.10.45", labBssid, scan2);

        assertTrue(muleRes2.muleDetected(), "Consecutive scan under 2.5s from same BSSID must flag mule proxy");
    }

    @Test
    void testJa4TlsFingerprintValidation() {
        // Valid JA4 TLS fingerprint format
        String validJa4 = "t13d1516h2_8daaf6152771_019053289069";
        var res1 = tlsValidator.validateJa4Fingerprint(validJa4);
        assertTrue(res1.valid());

        // Blacklisted rogue scraper fingerprint
        String blacklistedJa4 = "t13d000000_000000000000_000000000000";
        var res2 = tlsValidator.validateJa4Fingerprint(blacklistedJa4);
        assertFalse(res2.valid());

        // Hardware attestation proof check
        assertTrue(tlsValidator.validateHardwareAttestation("DEV-ANDROID-1234", "secure-enclave-signature-proof-length-exceeds-32-chars"));
        assertFalse(tlsValidator.validateHardwareAttestation("DEV-ANDROID-1234", "too-short"));
    }
}
