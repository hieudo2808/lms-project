ackage com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.entity.PasswordResetToken;
import com.seikyuuressha.lms.entity.Users;
import com.seikyuuressha.lms.repository.PasswordResetTokenRepository;
import com.seikyuuressha.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
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
        
        tokenRepository.deleteByUser(user);
        
        String resetCode = generateResetCode();
        
        PasswordResetToken token = PasswordResetToken.builder()
                .user(user)
                .resetCode(resetCode)
                .expiresAt(OffsetDateTime.now().plusMinutes(EXPIRY_MINUTES))
                .build();
        
        tokenRepository.save(token);
        
        emailService.sendPasswordResetEmail(email, resetCode);
    }
    
    @Transactional
    public void resetPassword(String resetCode, String newPassword) {
        PasswordResetToken token = tokenRepository
                .findByResetCodeAndIsUsedFalseAndExpiresAtAfter(resetCode, OffsetDateTime.now())
                .orElseThrow(() -> new RuntimeException("Mã xác nhận không hợp lệ hoặc đã hết hạn"));
        
        token.setUsed(true);
        tokenRepository.save(token);
        
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
    
    
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteByExpiresAtBefore(OffsetDateTime.now());
        log.debug("Expired password reset tokens cleanup completed");
    }
}
