package com.campusnotify.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * L3: Spatial Velocity Filter.
 * Enforces Haversine distance velocity clamping and detects backpack mule proxy collusion
 * (multiple student scans within 2.5s from the same IP/BSSID).
 */
@Component
public class SpatialVelocityFilter {

    private static final Logger log = LoggerFactory.getLogger(SpatialVelocityFilter.class);
    private static final double EARTH_RADIUS_METERS = 6371000.0;

    private final double maxVelocityMetersPerSec;
    private final double muleThresholdSeconds;

    // Track last scan location per student: studentId -> ScanPoint
    private final Map<UUID, ScanPoint> lastStudentScans = new ConcurrentHashMap<>();

    // Track scans per network key (IP or BSSID): networkKey -> LastNetworkScan
    private final Map<String, LastNetworkScan> networkScanLedger = new ConcurrentHashMap<>();

    public record ScanPoint(double lat, double lng, Instant timestamp) {}
    public record LastNetworkScan(UUID studentId, String token, Instant timestamp) {}

    public record VelocityCheckResult(boolean valid, double velocityMetersPerSec, double distanceMeters, String reason) {}
    public record MuleCheckResult(boolean muleDetected, String reason) {}

    public SpatialVelocityFilter(
            @Value("${campusnotify.security.spatial.max-velocity-meters-per-sec:35.0}") double maxVelocityMetersPerSec,
            @Value("${campusnotify.security.spatial.mule-scan-threshold-seconds:2.5}") double muleThresholdSeconds) {
        this.maxVelocityMetersPerSec = maxVelocityMetersPerSec;
        this.muleThresholdSeconds = muleThresholdSeconds;
    }

    /**
     * Calculates great-circle Haversine distance between two latitude/longitude points in meters.
     */
    public double calculateHaversineDistance(double lat1, double lng1, double lat2, double lng2) {
        double phi1 = Math.toRadians(lat1);
        double phi2 = Math.toRadians(lat2);
        double deltaPhi = Math.toRadians(lat2 - lat1);
        double deltaLambda = Math.toRadians(lng2 - lng1);

        double a = Math.sin(deltaPhi / 2.0) * Math.sin(deltaPhi / 2.0)
                + Math.cos(phi1) * Math.cos(phi2)
                * Math.sin(deltaLambda / 2.0) * Math.sin(deltaLambda / 2.0);

        double c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
        return EARTH_RADIUS_METERS * c;
    }

    /**
     * Checks if current scan exceeds maximum allowed physical velocity from student's previous scan.
     */
    public VelocityCheckResult validateSpatialVelocity(UUID studentId, double currentLat, double currentLng, Instant currentTimestamp) {
        ScanPoint previous = lastStudentScans.get(studentId);
        lastStudentScans.put(studentId, new ScanPoint(currentLat, currentLng, currentTimestamp));

        if (previous == null) {
            return new VelocityCheckResult(true, 0.0, 0.0, "Initial scan location recorded");
        }

        long timeDeltaMillis = Math.abs(currentTimestamp.toEpochMilli() - previous.timestamp().toEpochMilli());
        if (timeDeltaMillis == 0) {
            // Concurrent scan from different locations
            double distance = calculateHaversineDistance(previous.lat(), previous.lng(), currentLat, currentLng);
            if (distance > 10.0) {
                return new VelocityCheckResult(false, Double.POSITIVE_INFINITY, distance, "Simultaneous scans from different locations");
            }
            return new VelocityCheckResult(true, 0.0, distance, "Immediate sequential scan");
        }

        double timeDeltaSeconds = timeDeltaMillis / 1000.0;
        double distanceMeters = calculateHaversineDistance(previous.lat(), previous.lng(), currentLat, currentLng);
        double velocity = distanceMeters / timeDeltaSeconds;

        if (velocity > maxVelocityMetersPerSec && distanceMeters > 50.0) {
            log.warn("Spatial velocity violation for student [{}]: speed={:.2f} m/s, distance={:.2f}m in {:.2f}s",
                    studentId, velocity, distanceMeters, timeDeltaSeconds);
            return new VelocityCheckResult(false, velocity, distanceMeters,
                    String.format("Spatial velocity exceeded: %.2f m/s (Limit: %.2f m/s)", velocity, maxVelocityMetersPerSec));
        }

        return new VelocityCheckResult(true, velocity, distanceMeters, "Velocity within physical bounds");
    }

    /**
     * Checks if multiple students are scanning using the same physical device/hotspot in rapid succession (Mule Proxy).
     */
    public MuleCheckResult checkMuleProxy(UUID studentId, String token, String clientIp, String clientBssid, Instant scanTimestamp) {
        String networkKey = (clientBssid != null && !clientBssid.isBlank()) ? clientBssid : clientIp;
        if (networkKey == null || networkKey.isBlank()) {
            return new MuleCheckResult(false, "No network identifier available");
        }

        LastNetworkScan previous = networkScanLedger.get(networkKey);
        networkScanLedger.put(networkKey, new LastNetworkScan(studentId, token, scanTimestamp));

        if (previous != null && !previous.studentId().equals(studentId)) {
            long deltaMillis = Math.abs(scanTimestamp.toEpochMilli() - previous.timestamp().toEpochMilli());
            double deltaSeconds = deltaMillis / 1000.0;

            if (deltaSeconds < muleThresholdSeconds) {
                log.warn("MULE_PROXY_SUSPECTED: Student [{}] and Student [{}] scanned same network [{}] within {:.2f}s",
                        previous.studentId(), studentId, networkKey, deltaSeconds);
                return new MuleCheckResult(true,
                        String.format("Mule proxy collusion detected: %.2fs delta between distinct students on %s", deltaSeconds, networkKey));
            }
        }

        return new MuleCheckResult(false, "No mule pattern detected");
    }

    /**
     * Validates whether student is within classroom geofence radius.
     */
    public boolean isWithinGeofence(double studentLat, double studentLng, double targetLat, double targetLng, double radiusMeters) {
        double distance = calculateHaversineDistance(studentLat, studentLng, targetLat, targetLng);
        return distance <= radiusMeters;
    }

    public void clearHistory() {
        lastStudentScans.clear();
        networkScanLedger.clear();
    }
}
