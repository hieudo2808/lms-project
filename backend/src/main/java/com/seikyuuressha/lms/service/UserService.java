package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.request.UpdateProfileRequest;
import com.seikyuuressha.lms.dto.response.UserResponse;
import com.seikyuuressha.lms.entity.Users;
import com.seikyuuressha.lms.mapper.UserMapper;
import com.seikyuuressha.lms.repository.UserRepository;
import com.seikyuuressha.lms.service.common.SecurityContextService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final SecurityContextService securityContextService;

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        Users user = securityContextService.getCurrentUser();
        return userMapper.toUserResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID userId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userMapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        Users user = securityContextService.getCurrentUser();

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
        return userMapper.toUserResponse(user);
    }
}
