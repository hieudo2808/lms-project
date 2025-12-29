package com.seikyuuressha.lms.mapper;

import com.seikyuuressha.lms.dto.response.AnswerResponse;
import com.seikyuuressha.lms.dto.response.QuestionResponse;
import com.seikyuuressha.lms.dto.response.QuizAnswerResponse;
import com.seikyuuressha.lms.dto.response.QuizAttemptResponse;
import com.seikyuuressha.lms.dto.response.QuizResponse;
import com.seikyuuressha.lms.entity.Answer;
import com.seikyuuressha.lms.entity.Question;
import com.seikyuuressha.lms.entity.Quiz;
import com.seikyuuressha.lms.entity.QuizAnswer;
import com.seikyuuressha.lms.entity.QuizAttempt;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface QuizMapper {

    @Mapping(target = "courseId", source = "course.courseId")
    @Mapping(target = "moduleId", source = "module.moduleId")
    @Mapping(target = "lessonId", source = "lesson.lessonId")
    @Mapping(target = "questions", source = "questions")
    QuizResponse toQuizResponse(Quiz quiz);

    @Mapping(target = "quizId", source = "quiz.quizId")
    @Mapping(target = "answers", source = "answers")
    @Mapping(target = "questionType", source = "type")
    QuestionResponse toQuestionResponse(Question question);

    @Mapping(target = "questionId", source = "question.questionId")
    AnswerResponse toAnswerResponse(Answer answer);

    @Mapping(target = "userId", source = "user.userId")
    @Mapping(target = "quiz", source = "quiz")
    @Mapping(target = "startTime", source = "startedAt")
    @Mapping(target = "endTime", source = "submittedAt")
    @Mapping(target = "userAnswers", ignore = true)
    QuizAttemptResponse toQuizAttemptResponse(QuizAttempt attempt);

    @Mapping(target = "answerId", source = "quizAnswerId")
    @Mapping(target = "attemptId", source = "attempt.attemptId")
    @Mapping(target = "questionId", source = "question.questionId")
    @Mapping(target = "selectedAnswerId", source = "quizAnswer", qualifiedByName = "firstSelectedAnswerId")
    @Mapping(target = "userAnswer", source = "textAnswer")
    @Mapping(target = "pointsAwarded", source = "pointsEarned")
    QuizAnswerResponse toQuizAnswerResponse(QuizAnswer quizAnswer);

    @Named("firstSelectedAnswerId")
    default java.util.UUID getFirstSelectedAnswerId(QuizAnswer answer) {
        if (answer.getSelectedAnswers() != null && !answer.getSelectedAnswers().isEmpty()) {
            return answer.getSelectedAnswers().get(0).getAnswerId();
        }
        return null;
    }

    List<QuestionResponse> toQuestionResponseList(List<Question> questions);
    List<AnswerResponse> toAnswerResponseList(List<Answer> answers);
    List<QuizAnswerResponse> toQuizAnswerResponseList(List<QuizAnswer> answers);
}
