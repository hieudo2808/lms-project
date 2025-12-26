package com.seikyuuressha.lms.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.seikyuuressha.lms.dto.request.LoginRequest;
import com.seikyuuressha.lms.dto.request.RegisterRequest;
import com.seikyuuressha.lms.dto.response.AuthResponse;
import com.seikyuuressha.lms.entity.Roles;
import com.seikyuuressha.lms.entity.Users;
import com.seikyuuressha.lms.repository.RoleRepository;
import com.seikyuuressha.lms.repository.UserRepository;
import com.seikyuuressha.lms.mapper.UserMapper;
import com.seikyuuressha.lms.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final UserMapper userMapper;
    private final PasswordResetService passwordResetService;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Roles studentRole = roleRepository.findByRoleName("STUDENT")
                .orElseThrow(() -> new RuntimeException("Student role not found"));

        Users user = Users.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(studentRole)
                .createdAt(OffsetDateTime.now())
                .isActive(true)
                .build();

        Users savedUser = userRepository.save(user);

        String token = jwtUtil.generateToken(savedUser);
        String refreshToken = jwtUtil.generateRefreshToken(savedUser);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .user(userMapper.toUserResponse(savedUser))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        Users user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isActive()) {
            throw new RuntimeException("User account is inactive");
        }

        String token = jwtUtil.generateToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .user(userMapper.toUserResponse(user))
                .build();
    }

    @Transactional
    public AuthResponse googleLogin(String idToken) {
        try {
            // Verify Google ID Token
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken googleIdToken = verifier.verify(idToken);
            if (googleIdToken == null) {
                throw new RuntimeException("Invalid ID token");
            }

            GoogleIdToken.Payload payload = googleIdToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");
            Boolean emailVerified = payload.getEmailVerified();

            if (!emailVerified) {
                throw new RuntimeException("Email not verified");
            }

            // Check if user exists
            Optional<Users> existingUser = userRepository.findByEmail(email);
            Users user;

            if (existingUser.isPresent()) {
                user = existingUser.get();
                
                // Update avatar if changed
                if (pictureUrl != null && !pictureUrl.equals(user.getAvatarUrl())) {
                    user.setAvatarUrl(pictureUrl);
                    user = userRepository.save(user);
                }
            } else {
                // Create new user
                Roles studentRole = roleRepository.findByRoleName("STUDENT")
                        .orElseThrow(() -> new RuntimeException("Student role not found"));

                user = Users.builder()
                        .fullName(name)
                        .email(email)
                        .avatarUrl(pictureUrl)
                        .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString())) // Random password
                        .role(studentRole)
                        .createdAt(OffsetDateTime.now())
                        .isActive(true)
                        .build();

                user = userRepository.save(user);
            }

            String token = jwtUtil.generateToken(user);
            String refreshToken = jwtUtil.generateRefreshToken(user);

            return AuthResponse.builder()
                    .token(token)
                    .refreshToken(refreshToken)
                    .user(userMapper.toUserResponse(user))
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Google login failed: " + e.getMessage(), e);
        }
    }
    
    @Transactional
    public void requestPasswordReset(String email) {
        passwordResetService.requestPasswordReset(email);
    }
    
    @Transactional
    public void resetPassword(String resetCode, String newPassword) {
        // Encode password before passing to service
        String encodedPassword = passwordEncoder.encode(newPassword);
        passwordResetService.resetPassword(resetCode, encodedPassword);
    }
}
