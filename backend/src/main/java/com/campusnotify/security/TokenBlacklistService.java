package com.campusnotify.security;

public interface TokenBlacklistService {

    /**
     * Revokes a JWT by blacklisting its unique JTI identifier.
     * @param jti Unique JWT ID claim
     * @param ttlSeconds Remaining token lifetime in seconds
     */
    void blacklistToken(String jti, long ttlSeconds);

    /**
     * Checks if a JTI is present in the blacklist.
     * @param jti Unique JWT ID claim
     * @return true if blacklisted/revoked, false otherwise
     */
    boolean isBlacklisted(String jti);
}
