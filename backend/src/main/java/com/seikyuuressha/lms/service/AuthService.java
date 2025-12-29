ackage com.seikyuuressha.lms.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.seikyuuressha.lms.dto.request.LoginRequest;
import com.seikyuuressha.lms.dto.request.RegisterRequest;
import com.seikyuuressha.lms.dto.response.AuthResponse;
import com.seikyuuressha.lms.entity.Roles;
import com.seikyuuressha.lms.entity.Users;
import com.seikyuuressha.lms.mapper.UserMapper;
import com.seikyuuressha.lms.repository.RoleRepository;
import com.seikyuuressha.lms.repository.UserRepository;
import com.seikyuuressha.lms.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Collections;
import java.util.Date;
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
    private final com.seikyuuressha.lms.repository.InvalidatedTokenRepository invalidatedTokenRepository;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    private volatile GoogleIdTokenVerifier googleVerifier;

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

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Users user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (user.getBlockUntil() != null && user.getBlockUntil().isAfter(OffsetDateTime.now())) {
            long minutesRemaining = java.time.Duration.between(OffsetDateTime.now(), user.getBlockUntil()).toMinutes();
            throw new RuntimeException("Account locked. Try again in " + minutesRemaining + " minutes.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            if (user.getFailedLoginAttempts() > 0) {
                user.setFailedLoginAttempts(0);
                user.setBlockUntil(null);
                userRepository.save(user);
            }

        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);

            if (user.getFailedLoginAttempts() >= 5) {
                user.setBlockUntil(OffsetDateTime.now().plusMinutes(15));
            }
            userRepository.save(user);

            throw new RuntimeException("Invalid credentials");
        }

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
            GoogleIdToken googleIdToken = getGoogleVerifier().verify(idToken);
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

            Optional<Users> existingUser = userRepository.findByEmail(email);
            Users user;

            if (existingUser.isPresent()) {
                user = existingUser.get();
                
                if (pictureUrl != null && (user.getAvatarUrl() == null || user.getAvatarUrl().isEmpty())) {
                    user.setAvatarUrl(pictureUrl);
                    user = userRepository.save(user);
                }
            } else {
                Roles studentRole = roleRepository.findByRoleName("STUDENT")
                        .orElseThrow(() -> new RuntimeException("Student role not found"));

                user = Users.builder()
                        .fullName(name)
                        .email(email)
                        .avatarUrl(pictureUrl)
                        .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
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
        String encodedPassword = passwordEncoder.encode(newPassword);
        passwordResetService.resetPassword(resetCode, encodedPassword);
    }

    
    @Transactional
    public AuthResponse refreshAccessToken(String refreshToken) {
        try {
            String tokenId = jwtUtil.extractTokenId(refreshToken);
            String email = jwtUtil.extractUsername(refreshToken);
            Date expiration = jwtUtil.extractExpiration(refreshToken);

            if (tokenId != null && invalidatedTokenRepository.existsByTokenId(tokenId)) {
                throw new RuntimeException("Refresh token has been revoked");
            }

            Users user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!user.isActive()) {
                throw new RuntimeException("User account is inactive");
            }

            if (tokenId != null) {
                com.seikyuuressha.lms.entity.InvalidatedToken invalidated =
                        com.seikyuuressha.lms.entity.InvalidatedToken.builder()
                                .tokenId(tokenId)
                                .expiryTime(OffsetDateTime.ofInstant(expiration.toInstant(), ZoneOffset.UTC))
                                .invalidatedAt(OffsetDateTime.now())
                                .build();
                invalidatedTokenRepository.save(invalidated);
            }

            String newAccessToken = jwtUtil.generateToken(user);
            String newRefreshToken = jwtUtil.generateRefreshToken(user);

            return AuthResponse.builder()
                    .token(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .user(userMapper.toUserResponse(user))
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Invalid refresh token: " + e.getMessage());
        }
    }

    
    @Transactional
    public boolean logout(String refreshToken) {
        try {
            String tokenId = jwtUtil.extractTokenId(refreshToken);
            Date expiration = jwtUtil.extractExpiration(refreshToken);

            if (tokenId != null) {
                com.seikyuuressha.lms.entity.InvalidatedToken invalidated =
                        com.seikyuuressha.lms.entity.InvalidatedToken.builder()
                                .tokenId(tokenId)
                                .expiryTime(OffsetDateTime.ofInstant(expiration.toInstant(), ZoneOffset.UTC))
                                .invalidatedAt(OffsetDateTime.now())
                                .build();
                invalidatedTokenRepository.save(invalidated);
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    
    private GoogleIdTokenVerifier getGoogleVerifier() {
        if (googleVerifier == null) {
            synchronized (this) {
                if (googleVerifier == null) {
                    googleVerifier = new GoogleIdTokenVerifier.Builder(
                            new NetHttpTransport(), new GsonFactory())
                            .setAudience(Collections.singletonList(googleClientId))
                            .build();
                }
            }
        }
        return googleVerifier;
    }
}
