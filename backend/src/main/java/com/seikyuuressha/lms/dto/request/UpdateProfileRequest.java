package com.seikyuuressha.lms.dto.request;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    private String fullName;
    private String bio;
    private String avatarUrl;
}
