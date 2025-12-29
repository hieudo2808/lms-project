package com.seikyuuressha.lms.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizAnswerResponse {
    UUID answerId;
    UUID attemptId;
    UUID questionId;
    UUID selectedAnswerId;
    String userAnswer;
    Boolean isCorrect;
    Integer pointsAwarded;
}
