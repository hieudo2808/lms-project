package com.seikyuuressha.lms.repository;

import com.seikyuuressha.lms.entity.InvalidatedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;

@Repository
public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {
    boolean existsByTokenId(String tokenId);
    
    @Modifying
    void deleteByExpiryTimeBefore(OffsetDateTime time);
}
