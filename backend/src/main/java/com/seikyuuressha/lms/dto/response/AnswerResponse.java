package com.seikyuuressha.lms.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AnswerResponse {
    UUID answerId;
    UUID questionId;
    String answerText;
    Boolean isCorrect; // Only show to instructor or after quiz submission
    Integer orderIndex;
}
