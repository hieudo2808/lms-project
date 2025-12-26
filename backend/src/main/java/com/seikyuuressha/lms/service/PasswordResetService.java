package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.entity.PasswordResetToken;
import com.seikyuuressha.lms.entity.Users;
import com.seikyuuressha.lms.repository.PasswordResetTokenRepository;
import com.seikyuuressha.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class PasswordResetService {
    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    
    private static final int CODE_LENGTH = 6;
    private static final int EXPIRY_MINUTES = 15;
    private static final SecureRandom random = new SecureRandom();
    
    @Transactional
    public void requestPasswordReset(String email) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại trong hệ thống"));
        
        // Delete old tokens for this user
        tokenRepository.deleteByUser(user);
        
        // Generate 6-digit code
        String resetCode = generateResetCode();
        
        // Create new token
        PasswordResetToken token = PasswordResetToken.builder()
                .user(user)
                .resetCode(resetCode)
                .expiresAt(OffsetDateTime.now().plusMinutes(EXPIRY_MINUTES))
                .build();
        
        tokenRepository.save(token);
        
        // Send email
        emailService.sendPasswordResetEmail(email, resetCode);
    }
    
    @Transactional
    public void resetPassword(String resetCode, String newPassword) {
        PasswordResetToken token = tokenRepository
                .findByResetCodeAndIsUsedFalseAndExpiresAtAfter(resetCode, OffsetDateTime.now())
                .orElseThrow(() -> new RuntimeException("Mã xác nhận không hợp lệ hoặc đã hết hạn"));
        
        // Mark token as used
        token.setUsed(true);
        tokenRepository.save(token);
        
        // Update user password (will be encoded in AuthService)
        Users user = token.getUser();
        user.setPassword(newPassword);
        userRepository.save(user);
    }
    
    private String generateResetCode() {
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(random.nextInt(10));
        }
        return code.toString();
    }
    
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteByExpiresAtBefore(OffsetDateTime.now());
    }
}
