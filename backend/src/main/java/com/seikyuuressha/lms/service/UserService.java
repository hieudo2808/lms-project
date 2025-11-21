package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.request.UpdateProfileRequest;
import com.seikyuuressha.lms.dto.response.UserResponse;
import com.seikyuuressha.lms.entity.Users;
import com.seikyuuressha.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return mapToUserResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID userId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return mapToUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        userRepository.save(user);
        return mapToUserResponse(user);
    }

    private UserResponse mapToUserResponse(Users user) {
        return UserResponse.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .roleName(user.getRole().getRoleName())
                .createdAt(user.getCreatedAt())
                .isActive(user.isActive())
                .build();
    }
}
