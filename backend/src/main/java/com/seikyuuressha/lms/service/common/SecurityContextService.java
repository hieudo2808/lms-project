package com.seikyuuressha.lms.service.common;

import com.seikyuuressha.lms.entity.Users;
import com.seikyuuressha.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Centralized service for accessing security context information.
 * Replaces duplicated getCurrentUser() methods across services.
 */
@Service
@RequiredArgsConstructor
public class SecurityContextService {

    private final UserRepository userRepository;

    /**
     * Get the current authenticated user's ID from security context.
     * @return UUID of the current user
     * @throws RuntimeException if not authenticated
     */
    public UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getPrincipal() == null) {
            throw new RuntimeException("Unauthorized");
        }

        return (UUID) authentication.getPrincipal();
    }

    /**
     * Get the current user ID if authenticated, or null if not.
     * Use this for operations that support both authenticated and anonymous users.
     * @return UUID of the current user, or null if not authenticated
     */
    public UUID getOptionalCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getPrincipal() == null) {
            return null;
        }

        if (authentication.getPrincipal() instanceof UUID) {
            return (UUID) authentication.getPrincipal();
        }

        return null;
    }

    /**
     * Get the current authenticated user entity.
     * @return Users entity
     * @throws RuntimeException if not authenticated or user not found
     */
    public Users getCurrentUser() {
        UUID userId = getCurrentUserId();
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Get the current authenticated user, verified as instructor or admin.
     * @return Users entity with INSTRUCTOR or ADMIN role
     * @throws RuntimeException if not an instructor/admin
     */
    public Users getCurrentInstructor() {
        Users user = getCurrentUser();

        if (!"INSTRUCTOR".equals(user.getRole().getRoleName()) &&
            !"ADMIN".equals(user.getRole().getRoleName())) {
            throw new RuntimeException("User is not an instructor");
        }

        return user;
    }

    /**
     * Check if current user has admin role.
     * @return true if current user is admin
     */
    public boolean isAdmin() {
        Users user = getCurrentUser();
        return "ADMIN".equals(user.getRole().getRoleName());
    }

    /**
     * Check if current user has instructor role.
     * @return true if current user is instructor or admin
     */
    public boolean isInstructor() {
        Users user = getCurrentUser();
        String role = user.getRole().getRoleName();
        return "INSTRUCTOR".equals(role) || "ADMIN".equals(role);
    }

    /**
     * Check if current user has a specific role.
     * Returns false if not authenticated.
     * @param roleName the role to check
     * @return true if current user has the specified role
     */
    public boolean hasRole(String roleName) {
        try {
            UUID userId = getOptionalCurrentUserId();
            if (userId == null) {
                return false;
            }
            Users user = userRepository.findById(userId).orElse(null);
            return user != null && roleName.equals(user.getRole().getRoleName());
        } catch (Exception e) {
            return false;
        }
    }
}
