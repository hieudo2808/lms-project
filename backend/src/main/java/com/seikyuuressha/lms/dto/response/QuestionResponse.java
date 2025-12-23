package com.seikyuuressha.lms.dto.response;

import com.seikyuuressha.lms.entity.Question;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuestionResponse {
    UUID questionId;
    UUID quizId;
    Question.QuestionType questionType;
    String questionText;
    String explanation;
    Integer points;
    Integer orderIndex;
    List<AnswerResponse> answers;
}
