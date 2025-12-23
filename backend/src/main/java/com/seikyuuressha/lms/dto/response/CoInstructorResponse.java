package com.seikyuuressha.lms.dto.response;

import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoInstructorResponse {
    private UUID userId;
    private String fullName;
    private String email;
    private String avatarUrl;
    private String role;    // OWNER or CO_INSTRUCTOR
    private OffsetDateTime addedAt;
}
