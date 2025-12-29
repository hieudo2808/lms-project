package com.seikyuuressha.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "PasswordResetTokens")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID tokenId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    Users user;
    
    @Column(nullable = false, length = 6)
    String resetCode;
    
    @Column(nullable = false)
    OffsetDateTime expiresAt;
    
    @Column(nullable = false)
    OffsetDateTime createdAt;
    
    boolean isUsed;
    
    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        isUsed = false;
    }
}
