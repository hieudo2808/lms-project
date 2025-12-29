package com.seikyuuressha.lms.dto.response;

import lombok.*;
import java.time.OffsetDateTime;
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
    private OffsetDateTime createdAt;
    private boolean isActive;
}
