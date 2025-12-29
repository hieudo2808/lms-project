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
public class CreateAnswerRequest {
    @NotNull(message = "Question ID is required")
    UUID questionId;

    @NotBlank(message = "Answer text is required")
    String answerText;

    @NotNull(message = "Must specify if answer is correct")
    Boolean isCorrect;
}
