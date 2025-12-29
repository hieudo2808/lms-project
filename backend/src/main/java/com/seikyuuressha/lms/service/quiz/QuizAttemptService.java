package com.seikyuuressha.lms.service.quiz;

import com.seikyuuressha.lms.dto.request.SubmitQuizAnswerRequest;
import com.seikyuuressha.lms.dto.response.QuizAnswerResponse;
import com.seikyuuressha.lms.dto.response.QuizAttemptResponse;
import com.seikyuuressha.lms.dto.response.QuizResponse;
import com.seikyuuressha.lms.entity.*;
import com.seikyuuressha.lms.mapper.QuizMapper;
import com.seikyuuressha.lms.repository.*;
import com.seikyuuressha.lms.service.common.SecurityContextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuizAttemptService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizAnswerRepository quizAnswerRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final UserRepository userRepository;
    private final SecurityContextService securityContextService;
    private final QuizMapper quizMapper;

    
    @Transactional
    public QuizAttemptResponse startQuizAttempt(UUID quizId) {
        UUID userId = securityContextService.getCurrentUserId();
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        if (!quiz.getIsPublished()) {
            throw new RuntimeException("Quiz is not published");
        }

        List<QuizAttempt> previousAttempts = quizAttemptRepository.findByUserAndQuizOrderByAttemptNumberDesc(user, quiz);
        if (quiz.getMaxAttempts() != null && previousAttempts.size() >= quiz.getMaxAttempts()) {
            throw new RuntimeException("Maximum attempts reached");
        }

        int attemptNumber = previousAttempts.isEmpty() ? 1 : previousAttempts.get(0).getAttemptNumber() + 1;

        Integer maxScore = quiz.getQuestions().stream()
                .map(Question::getPoints)
                .reduce(0, Integer::sum);

        QuizAttempt attempt = new QuizAttempt();
        attempt.setUser(user);
        attempt.setQuiz(quiz);
        attempt.setAttemptNumber(attemptNumber);
        attempt.setStartedAt(OffsetDateTime.now());
        attempt.setTotalScore(0);
        attempt.setMaxScore(maxScore);
        attempt.setPercentage(0.0);
        attempt.setStatus(QuizAttempt.AttemptStatus.IN_PROGRESS);
        attempt.setPassed(false);

        attempt = quizAttemptRepository.saveAndFlush(attempt);
        log.info("Quiz attempt started. AttemptId: {}, QuizId: {}, UserId: {}", 
                attempt.getAttemptId(), quizId, userId);
        
        return mapToQuizAttemptResponseWithAnswers(attempt);
    }

    
    @Transactional
    public QuizAnswerResponse submitQuizAnswer(UUID attemptId, SubmitQuizAnswerRequest request) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Quiz attempt not found"));

        if (attempt.getStatus() != QuizAttempt.AttemptStatus.IN_PROGRESS) {
            throw new RuntimeException("Quiz attempt is not in progress");
        }

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        Answer selectedAnswer = null;
        if (request.getAnswerId() != null) {
            selectedAnswer = answerRepository.findById(request.getAnswerId())
                    .orElseThrow(() -> new RuntimeException("Answer not found"));
        }

        boolean isCorrect = false;
        Integer pointsAwarded = 0;

        if (question.getType() == Question.QuestionType.SHORT_ANSWER) {
            isCorrect = false;
        } else if (selectedAnswer != null) {
            isCorrect = selectedAnswer.getIsCorrect();
            pointsAwarded = isCorrect ? question.getPoints() : 0;
        }

        QuizAnswer quizAnswer = quizAnswerRepository.findByAttemptAndQuestion(attempt, question)
                .orElse(null);
        
        if (quizAnswer != null) {
            quizAnswer.getSelectedAnswers().clear();
            if (selectedAnswer != null) {
                quizAnswer.getSelectedAnswers().add(selectedAnswer);
            }
            quizAnswer.setTextAnswer(request.getUserAnswer());
            quizAnswer.setIsCorrect(isCorrect);
            quizAnswer.setPointsEarned(pointsAwarded);
        } else {
            List<Answer> answerList = new ArrayList<>();
            if (selectedAnswer != null) {
                answerList.add(selectedAnswer);
            }
            quizAnswer = QuizAnswer.builder()
                    .attempt(attempt)
                    .question(question)
                    .selectedAnswers(answerList)
                    .textAnswer(request.getUserAnswer())
                    .isCorrect(isCorrect)
                    .pointsEarned(pointsAwarded)
                    .build();
        }

        quizAnswer = quizAnswerRepository.save(quizAnswer);
        
        return QuizAnswerResponse.builder()
                .answerId(quizAnswer.getQuizAnswerId())
                .attemptId(quizAnswer.getAttempt().getAttemptId())
                .questionId(quizAnswer.getQuestion().getQuestionId())
                .selectedAnswerId(selectedAnswer != null ? selectedAnswer.getAnswerId() : null)
                .userAnswer(quizAnswer.getTextAnswer())
                .isCorrect(null)
                .pointsAwarded(null)
                .build();
    }

    
    @Transactional
    public QuizAttemptResponse finishQuizAttempt(UUID attemptId) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Quiz attempt not found"));

        if (attempt.getStatus() != QuizAttempt.AttemptStatus.IN_PROGRESS) {
            throw new RuntimeException("Quiz attempt is not in progress");
        }

        List<QuizAnswer> answers = quizAnswerRepository.findByAttempt(attempt);
        Integer totalScore = answers.stream()
                .map(QuizAnswer::getPointsEarned)
                .reduce(0, Integer::sum);

        Double percentage = (totalScore.doubleValue() / attempt.getMaxScore()) * 100;
        boolean passed = percentage >= attempt.getQuiz().getPassingScore();

        attempt.setSubmittedAt(OffsetDateTime.now());
        attempt.setTotalScore(totalScore);
        attempt.setPercentage(percentage);
        attempt.setStatus(QuizAttempt.AttemptStatus.GRADED);
        attempt.setPassed(passed);

        attempt = quizAttemptRepository.save(attempt);
        log.info("Quiz attempt finished. AttemptId: {}, Score: {}/{}, Passed: {}", 
                attemptId, totalScore, attempt.getMaxScore(), passed);
        
        return mapToQuizAttemptResponseWithAnswers(attempt);
    }

    
    @Transactional(readOnly = true)
    public List<QuizAttemptResponse> getMyQuizAttempts(UUID quizId) {
        UUID userId = securityContextService.getCurrentUserId();
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        List<QuizAttempt> attempts = quizAttemptRepository.findByUserAndQuizOrderByAttemptNumberDesc(user, quiz);
        return attempts.stream()
                .map(this::mapToQuizAttemptResponseWithAnswers)
                .collect(Collectors.toList());
    }

    
    private QuizAttemptResponse mapToQuizAttemptResponseWithAnswers(QuizAttempt attempt) {
        List<QuizAnswerResponse> userAnswers = quizAnswerRepository.findByAttempt(attempt).stream()
                .map(quizMapper::toQuizAnswerResponse)
                .collect(Collectors.toList());

        QuizAttemptResponse response = quizMapper.toQuizAttemptResponse(attempt);
        response.setUserAnswers(userAnswers);
        return response;
    }
}
