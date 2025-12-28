package com.seikyuuressha.lms.controller;

import com.seikyuuressha.lms.dto.request.LoginRequest;
import com.seikyuuressha.lms.dto.response.AuthResponse;
import com.seikyuuressha.lms.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    private static final String REFRESH_TOKEN_COOKIE = "refresh_token";
    private static final Duration REFRESH_TOKEN_MAX_AGE = Duration.ofDays(7);

    /**
     * Login endpoint - sets refresh token as HTTP-only cookie
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request,
            HttpServletResponse response) {
        
        AuthResponse authResponse = authService.login(request);
        
        // Set refresh token as HTTP-only cookie
        setRefreshTokenCookie(response, authResponse.getRefreshToken());
        
        // Remove refresh token from response body (security)
        authResponse.setRefreshToken(null);
        
        return ResponseEntity.ok(authResponse);
    }

    /**
     * Refresh access token - reads refresh token from cookie
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(
            @CookieValue(name = REFRESH_TOKEN_COOKIE, required = false) String refreshToken,
            HttpServletResponse response) {
        
        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "No refresh token provided"));
        }

        try {
            AuthResponse authResponse = authService.refreshAccessToken(refreshToken);
            
            // Set new refresh token cookie
            setRefreshTokenCookie(response, authResponse.getRefreshToken());
            
            // Remove refresh token from response body
            authResponse.setRefreshToken(null);
            
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            // Clear invalid cookie
            clearRefreshTokenCookie(response);
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid or expired refresh token"));
        }
    }

    /**
     * Logout - clears refresh token cookie
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @CookieValue(name = REFRESH_TOKEN_COOKIE, required = false) String refreshToken,
            HttpServletResponse response) {
        
        if (refreshToken != null && !refreshToken.isEmpty()) {
            try {
                authService.logout(refreshToken);
            } catch (Exception ignored) {
                // Ignore errors during logout
            }
        }
        
        clearRefreshTokenCookie(response);
        
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    /* -------------------------------------------------------------------------- */
    /*                          COOKIE HELPER METHODS                             */
    /* -------------------------------------------------------------------------- */

    private void setRefreshTokenCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE, token)
                .httpOnly(true)           // Not accessible via JavaScript
                .secure(false)            // TODO: Set to true in production (HTTPS)
                .sameSite("Lax")          // CSRF protection
                .path("/")                // Available for all paths
                .maxAge(REFRESH_TOKEN_MAX_AGE)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE, "")
                .httpOnly(true)
                .secure(false)            // TODO: Set to true in production
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ZERO)    // Immediately expire
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
