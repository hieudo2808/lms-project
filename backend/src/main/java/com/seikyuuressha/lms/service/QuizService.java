package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.request.*;
import com.seikyuuressha.lms.dto.response.*;
import com.seikyuuressha.lms.entity.*;
import com.seikyuuressha.lms.entity.Module;
import com.seikyuuressha.lms.mapper.QuizMapper;
import com.seikyuuressha.lms.repository.*;
import com.seikyuuressha.lms.service.common.SecurityContextService;
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
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final CourseRepository courseRepository;
    private final ModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;
    private final SecurityContextService securityContextService;
    private final QuizMapper quizMapper;

    
    @Transactional
    public QuizResponse createQuiz(CreateQuizRequest request) {
        Course course;
        if (request.getCourseId() != null) {
            course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found"));
        } else if (request.getLessonId() != null) {
            Lesson lesson = lessonRepository.findById(request.getLessonId())
                    .orElseThrow(() -> new RuntimeException("Lesson not found"));
            course = lesson.getModule().getCourse();
        } else {
            throw new RuntimeException("Either courseId or lessonId must be provided");
        }

        Module module = null;
        if (request.getModuleId() != null) {
            module = moduleRepository.findById(request.getModuleId())
                    .orElseThrow(() -> new RuntimeException("Module not found"));
        }

        Lesson lesson = null;
        if (request.getLessonId() != null) {
            lesson = lessonRepository.findById(request.getLessonId())
                    .orElseThrow(() -> new RuntimeException("Lesson not found"));
        }

        Quiz quiz = new Quiz();
        quiz.setCourse(course);
        quiz.setModule(module);
        quiz.setLesson(lesson);
        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setPassingScore(request.getPassingScore());
        quiz.setTimeLimit(request.getTimeLimit() != null ? request.getTimeLimit() : 0);
        quiz.setMaxAttempts(request.getMaxAttempts() != null ? request.getMaxAttempts() : 0);
        quiz.setIsPublished(false);
        quiz.setOrderIndex(0);

        quiz = quizRepository.save(quiz);
        log.info("Quiz created. QuizId: {}, Title: {}", quiz.getQuizId(), quiz.getTitle());
        return quizMapper.toQuizResponse(quiz);
    }

    
    @Transactional
    public QuizResponse updateQuiz(UUID quizId, UpdateQuizRequest request) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setPassingScore(request.getPassingScore());
        quiz.setTimeLimit(request.getTimeLimit() != null ? request.getTimeLimit() : 0);
        quiz.setMaxAttempts(request.getMaxAttempts());
        quiz.setIsPublished(request.getIsPublished());

        quiz = quizRepository.save(quiz);
        return quizMapper.toQuizResponse(quiz);
    }

    
    @Transactional
    public QuizResponse publishQuiz(UUID quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        quiz.setIsPublished(true);
        quiz = quizRepository.save(quiz);
        log.info("Quiz published. QuizId: {}", quizId);
        return quizMapper.toQuizResponse(quiz);
    }

    
    @Transactional
    public boolean deleteQuiz(UUID quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        if (quiz.getQuestions() != null) {
            for (Question q : quiz.getQuestions()) {
                if (q.getAnswers() != null && !q.getAnswers().isEmpty()) {
                    answerRepository.deleteAll(q.getAnswers());
                }
                questionRepository.delete(q);
            }
        }

        quizRepository.delete(quiz);
        log.info("Quiz deleted. QuizId: {}", quizId);
        return true;
    }

    
    @Transactional(readOnly = true)
    public List<QuizResponse> getQuizzesByLesson(UUID lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        List<Quiz> quizzes = quizRepository.findByLesson_LessonIdOrderByOrderIndex(lessonId);
        
        return quizzes.stream()
                .map(quizMapper::toQuizResponse)
                .collect(Collectors.toList());
    }

    
    @Transactional(readOnly = true)
    public QuizResponse getQuizById(UUID quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        return quizMapper.toQuizResponse(quiz);
    }
}
