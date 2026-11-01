package com.campusnotify.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.List;
import java.util.UUID;

/**
 * L1: Sliding Token Renewal Interceptor.
 * Prevents 401 submission wipeout mid-practical by silently issuing a renewed JWT
 * in the X-Renewed-Token response header whenever token expiration is within 15 minutes.
 */
@Component
public class SlidingTokenRenewalInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(SlidingTokenRenewalInterceptor.class);
    public static final String RENEWED_TOKEN_HEADER = "X-Renewed-Token";

    private final JwtTokenProvider jwtTokenProvider;

    public SlidingTokenRenewalInterceptor(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String token = extractToken(request);

        if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
            if (jwtTokenProvider.isWithinRenewalThreshold(token)) {
                try {
                    Claims claims = jwtTokenProvider.parseClaims(token);
                    UUID userId = UUID.fromString(claims.getSubject());
                    String username = claims.get("username", String.class);
                    String department = claims.get("dept", String.class);
                    String prn = claims.get("prn", String.class);
                    @SuppressWarnings("unchecked")
                    List<String> roles = claims.get("roles", List.class);

                    String renewedToken = jwtTokenProvider.generateAccessToken(userId, username, roles, department, prn);
                    response.setHeader(RENEWED_TOKEN_HEADER, renewedToken);
                    response.setHeader("Access-Control-Expose-Headers", RENEWED_TOKEN_HEADER);
                    log.debug("Sliding renewal triggered for user [{}], issued new token with JTI", userId);
                } catch (Exception e) {
                    log.warn("Failed to generate renewed sliding token: {}", e.getMessage());
                }
            }
        }
        return true;
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
