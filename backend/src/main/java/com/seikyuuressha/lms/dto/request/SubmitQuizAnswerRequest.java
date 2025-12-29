package com.seikyuuressha.lms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SubmitQuizAnswerRequest {
    @NotNull(message = "Question ID is required")
    UUID questionId;

    UUID answerId;

    String userAnswer;
}
