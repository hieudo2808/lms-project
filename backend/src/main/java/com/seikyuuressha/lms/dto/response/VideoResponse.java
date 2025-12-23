package com.seikyuuressha.lms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoResponse {

    private UUID videoId;
    private UUID lessonId;
    private String originalFilename;
    private Long fileSize;
    private String mimeType;
    private Integer durationSeconds;
    private String resolution;
    private String processingStatus;
    private String streamUrl;
    private String thumbnailUrl;
    private OffsetDateTime uploadedAt;
    private OffsetDateTime processedAt;
    private String errorMessage;
}
