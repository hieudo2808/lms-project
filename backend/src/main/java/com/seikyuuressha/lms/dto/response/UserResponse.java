package com.seikyuuressha.lms.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID userId;
    private String fullName;
    private String email;
    private String avatarUrl;
    private String bio;
    private String roleName;
    private LocalDateTime createdAt;
    private boolean isActive;
}
