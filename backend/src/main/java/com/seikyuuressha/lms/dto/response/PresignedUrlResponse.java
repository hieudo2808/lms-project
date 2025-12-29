package com.seikyuuressha.lms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresignedUrlResponse {

    private UUID videoId;
    private String uploadUrl;
    private String s3Key;
    private String publicUrl;
    private Long expiresIn;
}
