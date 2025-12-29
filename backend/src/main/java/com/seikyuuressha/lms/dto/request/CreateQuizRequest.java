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
public class CreateQuizRequest {
    UUID courseId;

    UUID moduleId;

    UUID lessonId;

    @NotBlank(message = "Title is required")
    String title;

    String description;

    @NotNull(message = "Passing score is required")
    Integer passingScore;

    Integer timeLimit;

    Integer maxAttempts;
}
