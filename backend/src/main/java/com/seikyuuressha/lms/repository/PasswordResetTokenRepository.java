package com.seikyuuressha.lms.repository;

import com.seikyuuressha.lms.entity.PasswordResetToken;
import com.seikyuuressha.lms.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findByResetCodeAndIsUsedFalseAndExpiresAtAfter(
            String resetCode, OffsetDateTime currentTime);
    
    void deleteByUser(Users user);
    
    void deleteByExpiresAtBefore(OffsetDateTime expiryTime);
}
