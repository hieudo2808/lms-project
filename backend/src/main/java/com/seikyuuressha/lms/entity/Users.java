package com.seikyuuressha.lms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "Users")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    UUID userId;
    
    @Column(nullable = false, length = 100)
    String fullName;
    
    @Column(nullable = false, unique = true, length = 100)
    String email;
    
    @Column(nullable = false, length = 255)
    String password;
    
    @Column(length = 255)
    String avatarUrl;
    
    @Column(length = 500)
    String bio;

    LocalDateTime createdAt;

    boolean isActive;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roleId", nullable = false)
    Roles role;
}
