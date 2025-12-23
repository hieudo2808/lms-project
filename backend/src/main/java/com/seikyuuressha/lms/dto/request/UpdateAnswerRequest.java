package com.seikyuuressha.lms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateAnswerRequest {
    @NotNull(message = "Answer ID is required")
    java.util.UUID answerId;

    @NotBlank(message = "Answer text is required")
    String answerText;

    @NotNull(message = "Must specify if answer is correct")
    Boolean isCorrect;
}