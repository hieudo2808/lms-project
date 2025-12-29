package com.seikyuuressha.lms.service.quiz;

import com.seikyuuressha.lms.dto.request.CreateAnswerRequest;
import com.seikyuuressha.lms.dto.request.CreateQuestionRequest;
import com.seikyuuressha.lms.dto.request.UpdateAnswerRequest;
import com.seikyuuressha.lms.dto.request.UpdateQuestionRequest;
import com.seikyuuressha.lms.dto.response.AnswerResponse;
import com.seikyuuressha.lms.dto.response.QuestionResponse;
import com.seikyuuressha.lms.entity.Answer;
import com.seikyuuressha.lms.entity.Question;
import com.seikyuuressha.lms.entity.Quiz;
import com.seikyuuressha.lms.mapper.QuizMapper;
import com.seikyuuressha.lms.repository.AnswerRepository;
import com.seikyuuressha.lms.repository.QuestionRepository;
import com.seikyuuressha.lms.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final QuizRepository quizRepository;
    private final QuizMapper quizMapper;

    
    @Transactional
    public QuestionResponse createQuestion(CreateQuestionRequest request) {
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        int orderIndex = quiz.getQuestions() != null ? quiz.getQuestions().size() : 0;

        Question question = Question.builder()
                .quiz(quiz)
                .type(request.getQuestionType())
                .questionText(request.getQuestionText())
                .explanation(request.getExplanation())
                .points(request.getPoints())
                .orderIndex(orderIndex)
                .build();

        question = questionRepository.save(question);
        log.info("Question created. QuestionId: {}, QuizId: {}", question.getQuestionId(), quiz.getQuizId());
        return quizMapper.toQuestionResponse(question);
    }

    
    @Transactional
    public QuestionResponse updateQuestion(UUID questionId, UpdateQuestionRequest request) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        question.setType(request.getQuestionType());
        question.setQuestionText(request.getQuestionText());
        question.setExplanation(request.getExplanation());
        question.setPoints(request.getPoints());

        question = questionRepository.save(question);
        return quizMapper.toQuestionResponse(question);
    }

    
    @Transactional
    public boolean deleteQuestion(UUID questionId) {
        if (!questionRepository.existsById(questionId)) {
            throw new RuntimeException("Question not found");
        }
        questionRepository.deleteById(questionId);
        log.info("Question deleted. QuestionId: {}", questionId);
        return true;
    }

    
    @Transactional(readOnly = true)
    public QuestionResponse getQuestionById(UUID questionId) {
        Question question = questionRepository.findById(questionId)
                .orElse(null);
        
        if (question == null) {
            return null;
        }
        
        return quizMapper.toQuestionResponse(question);
    }

    
    @Transactional
    public AnswerResponse createAnswer(CreateAnswerRequest request) {
        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        int orderIndex = question.getAnswers() != null ? question.getAnswers().size() : 0;

        Answer answer = Answer.builder()
                .question(question)
                .answerText(request.getAnswerText())
                .isCorrect(request.getIsCorrect())
                .orderIndex(orderIndex)
                .build();

        answer = answerRepository.save(answer);
        log.info("Answer created. AnswerId: {}, QuestionId: {}", answer.getAnswerId(), question.getQuestionId());
        return quizMapper.toAnswerResponse(answer);
    }

    
    @Transactional
    public AnswerResponse updateAnswer(UUID answerId, UpdateAnswerRequest request) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new RuntimeException("Answer not found"));

        answer.setAnswerText(request.getAnswerText());
        answer.setIsCorrect(request.getIsCorrect());

        answer = answerRepository.save(answer);
        return quizMapper.toAnswerResponse(answer);
    }
}
