package com.seikyuuressha.lms.dto.response;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorResponse {
    private UUID userId;
    private String fullName;
    private String email;
    private String avatarUrl;
    private String bio;
}
