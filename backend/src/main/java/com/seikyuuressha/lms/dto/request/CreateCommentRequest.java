package com.seikyuuressha.lms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateCommentRequest {
    @NotNull(message = "Lesson ID is required")
    UUID lessonId;

    @NotBlank(message = "Content cannot be empty")
    String content;

    UUID parentCommentId;
}
