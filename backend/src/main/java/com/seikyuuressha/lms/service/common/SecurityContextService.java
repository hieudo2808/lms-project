package com.seikyuuressha.lms.service.common;

import com.seikyuuressha.lms.entity.Users;
import com.seikyuuressha.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SecurityContextService {

    private final UserRepository userRepository;

    
    public UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getPrincipal() == null) {
            throw new RuntimeException("Unauthorized");
        }

        return (UUID) authentication.getPrincipal();
    }

    
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

    
    public Users getCurrentUser() {
        UUID userId = getCurrentUserId();
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    
    public Users getCurrentInstructor() {
        Users user = getCurrentUser();

        if (!"INSTRUCTOR".equals(user.getRole().getRoleName()) &&
            !"ADMIN".equals(user.getRole().getRoleName())) {
            throw new RuntimeException("User is not an instructor");
        }

        return user;
    }

    
    public boolean isAdmin() {
        Users user = getCurrentUser();
        return "ADMIN".equals(user.getRole().getRoleName());
    }

    
    public boolean isInstructor() {
        Users user = getCurrentUser();
        String role = user.getRole().getRoleName();
        return "INSTRUCTOR".equals(role) || "ADMIN".equals(role);
    }

    
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
