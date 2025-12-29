package com.seikyuuressha.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.OffsetDateTime;

@Entity
@Table(name = "InvalidatedTokens")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InvalidatedToken {
    @Id
    @Column(length = 36)
    String tokenId;
    
    @Column(nullable = false)
    OffsetDateTime expiryTime;
    
    @Column(nullable = false)
    OffsetDateTime invalidatedAt;
    
    @PrePersist
    protected void onCreate() {
        if (invalidatedAt == null) {
            invalidatedAt = OffsetDateTime.now();
        }
    }
}
