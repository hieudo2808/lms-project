package com.seikyuuressha.lms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoUploadRequest {

    @NotNull(message = "Lesson ID is required")
    private UUID lessonId;

    @NotNull(message = "Filename is required")
    private String filename;

    @NotNull(message = "Content type is required")
    private String contentType;

    private Long fileSize;
}
