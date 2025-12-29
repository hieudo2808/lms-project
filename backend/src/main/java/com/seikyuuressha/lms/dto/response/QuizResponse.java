package com.seikyuuressha.lms.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizResponse {
    UUID quizId;
    UUID courseId;
    UUID moduleId;
    UUID lessonId;
    String title;
    String description;
    Integer passingScore;
    Integer timeLimit;
    Integer maxAttempts;
    Boolean isPublished;
    Integer orderIndex;
    List<QuestionResponse> questions;
}
