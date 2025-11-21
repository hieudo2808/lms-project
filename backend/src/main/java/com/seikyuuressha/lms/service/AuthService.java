package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.request.LoginRequest;
import com.seikyuuressha.lms.dto.request.RegisterRequest;
import com.seikyuuressha.lms.dto.response.AuthResponse;
import com.seikyuuressha.lms.dto.response.UserResponse;
import com.seikyuuressha.lms.entity.Roles;
import com.seikyuuressha.lms.entity.Users;
import com.seikyuuressha.lms.repository.RoleRepository;
import com.seikyuuressha.lms.repository.UserRepository;
import com.seikyuuressha.lms.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Get STUDENT role
        Roles studentRole = roleRepository.findByRoleName("STUDENT")
                .orElseThrow(() -> new RuntimeException("Student role not found"));

        // Create new user
        Users user = Users.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(studentRole)
                .createdAt(LocalDateTime.now())
                .isActive(true)
                .build();

        userRepository.save(user);

        // Generate tokens
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .user(mapToUserResponse(user))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        // Authenticate
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Get user
        Users user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isActive()) {
            throw new RuntimeException("User account is inactive");
        }

        // Generate tokens
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .user(mapToUserResponse(user))
                .build();
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
