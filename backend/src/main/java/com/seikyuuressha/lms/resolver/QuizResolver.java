ackage com.seikyuuressha.lms.resolver;

import com.seikyuuressha.lms.dto.request.*;
import com.seikyuuressha.lms.dto.response.*;
import com.seikyuuressha.lms.service.QuizService;
import com.seikyuuressha.lms.service.quiz.QuestionService;
import com.seikyuuressha.lms.service.quiz.QuizAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class QuizResolver {

    private final QuizService quizService;
    private final QuestionService questionService;
    private final QuizAttemptService quizAttemptService;

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<QuizResponse> getQuizzesByLesson(@Argument UUID lessonId) {
        return quizService.getQuizzesByLesson(lessonId);
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public QuizResponse getQuizById(@Argument UUID quizId) {
        return quizService.getQuizById(quizId);
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<QuizAttemptResponse> getMyQuizAttempts(@Argument UUID quizId) {
        return quizAttemptService.getMyQuizAttempts(quizId);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public QuizResponse createQuiz(@Argument CreateQuizRequest input) {
        return quizService.createQuiz(input);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public QuestionResponse createQuestion(@Argument CreateQuestionRequest input) {
        return questionService.createQuestion(input);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public AnswerResponse createAnswer(@Argument CreateAnswerRequest input) {
        return questionService.createAnswer(input);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public QuestionResponse updateQuestion(@Argument UUID questionId, @Argument UpdateQuestionRequest input) {
        return questionService.updateQuestion(questionId, input);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public AnswerResponse updateAnswer(@Argument UUID answerId, @Argument UpdateAnswerRequest input) {
        return questionService.updateAnswer(answerId, input);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public QuizResponse publishQuiz(@Argument UUID quizId) {
        return quizService.publishQuiz(quizId);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public QuizResponse updateQuiz(@Argument UUID quizId, @Argument UpdateQuizRequest input) {
        return quizService.updateQuiz(quizId, input);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public QuizAttemptResponse startQuizAttempt(@Argument UUID quizId) {
        return quizAttemptService.startQuizAttempt(quizId);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public QuizAnswerResponse submitQuizAnswer(@Argument UUID attemptId, @Argument SubmitQuizAnswerRequest input) {
        return quizAttemptService.submitQuizAnswer(attemptId, input);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public QuizAttemptResponse finishQuizAttempt(@Argument UUID attemptId) {
        return quizAttemptService.finishQuizAttempt(attemptId);
    }

    
    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public Boolean deleteQuestion(@Argument UUID questionId) {
        return questionService.deleteQuestion(questionId);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public Boolean deleteQuiz(@Argument UUID quizId) {
        return quizService.deleteQuiz(quizId);
    }
}
