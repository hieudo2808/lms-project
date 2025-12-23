package com.seikyuuressha.lms.resolver;

import com.seikyuuressha.lms.dto.request.*;
import com.seikyuuressha.lms.dto.response.*;
import com.seikyuuressha.lms.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class QuizResolver {

    private final QuizService quizService;

    @QueryMapping
    public List<QuizResponse> getQuizzesByLesson(@Argument UUID lessonId) {
        return quizService.getQuizzesByLesson(lessonId);
    }

    @QueryMapping
    public QuizResponse getQuizById(@Argument UUID quizId) {
        return quizService.getQuizById(quizId);
    }

    @QueryMapping
    public List<QuizAttemptResponse> getMyQuizAttempts(@Argument UUID quizId) {
        return quizService.getMyQuizAttempts(quizId);
    }

    @MutationMapping
    public QuizResponse createQuiz(@Argument CreateQuizRequest input) {
        return quizService.createQuiz(input);
    }

    @MutationMapping
    public QuestionResponse createQuestion(@Argument CreateQuestionRequest input) {
        return quizService.createQuestion(input);
    }

    @MutationMapping
    public AnswerResponse createAnswer(@Argument CreateAnswerRequest input) {
        return quizService.createAnswer(input);
    }

    @MutationMapping
    public QuestionResponse updateQuestion(@Argument UUID questionId, @Argument UpdateQuestionRequest input) {
        return quizService.updateQuestion(questionId, input);
    }

    @MutationMapping
    public AnswerResponse updateAnswer(@Argument UUID answerId, @Argument UpdateAnswerRequest input) {
        return quizService.updateAnswer(answerId, input);
    }

    @MutationMapping
    public QuizResponse publishQuiz(@Argument UUID quizId) {
        return quizService.publishQuiz(quizId);
    }

    @MutationMapping
    public QuizResponse updateQuiz(@Argument UUID quizId, @Argument UpdateQuizRequest input) {
        return quizService.updateQuiz(quizId, input);
    }

    @MutationMapping
    public QuizAttemptResponse startQuizAttempt(@Argument UUID quizId) {
        return quizService.startQuizAttempt(quizId);
    }

    @MutationMapping
    public QuizAnswerResponse submitQuizAnswer(@Argument UUID attemptId, @Argument SubmitQuizAnswerRequest input) {
        return quizService.submitQuizAnswer(attemptId, input);
    }

    @MutationMapping
    public QuizAttemptResponse finishQuizAttempt(@Argument UUID attemptId) {
        return quizService.finishQuizAttempt(attemptId);
    }
    
    @MutationMapping
    public Boolean deleteQuestion(@Argument UUID questionId) {
        return quizService.deleteQuestion(questionId);
    }

    @MutationMapping
    public Boolean deleteQuiz(@Argument UUID quizId) {
        return quizService.deleteQuiz(quizId);
    }
}
