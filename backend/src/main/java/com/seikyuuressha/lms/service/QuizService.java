package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.request.*;
import com.seikyuuressha.lms.dto.response.*;
import com.seikyuuressha.lms.entity.*;
import com.seikyuuressha.lms.entity.Module;
import com.seikyuuressha.lms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizAnswerRepository quizAnswerRepository;
    private final CourseRepository courseRepository;
    private final ModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;

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
        // Don't set quizId manually - let Hibernate generate it
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
        return mapToQuizResponse(quiz);
    }

    @Transactional
    public boolean deleteQuiz(UUID quizId) {
        // Load quiz with questions and answers and delete children explicitly to avoid
        // optimistic-locking / JDBC parameter binding issues when cascade deleting.
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        // Delete answers -> questions -> quiz in proper order
        if (quiz.getQuestions() != null) {
            for (Question q : quiz.getQuestions()) {
                if (q.getAnswers() != null && !q.getAnswers().isEmpty()) {
                    answerRepository.deleteAll(q.getAnswers());
                }
                questionRepository.delete(q);
            }
        }

        quizRepository.delete(quiz);
        return true;
    }

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
        return mapToQuestionResponse(question);
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
        return mapToAnswerResponse(answer);
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
        return mapToQuestionResponse(question);
    }

    @Transactional
    public AnswerResponse updateAnswer(UUID answerId, UpdateAnswerRequest request) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new RuntimeException("Answer not found"));

        answer.setAnswerText(request.getAnswerText());
        answer.setIsCorrect(request.getIsCorrect());

        answer = answerRepository.save(answer);
        return mapToAnswerResponse(answer);
    }

    @Transactional
    public QuizResponse publishQuiz(UUID quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        quiz.setIsPublished(true);
        quiz = quizRepository.save(quiz);
        return mapToQuizResponse(quiz);
    }

    @Transactional
    public QuizResponse updateQuiz(UUID quizId, UpdateQuizRequest request) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setPassingScore(request.getPassingScore());
        quiz.setTimeLimit(request.getTimeLimit() != null ? request.getTimeLimit() : 0);
        quiz.setMaxAttempts(request.getMaxAttempts() != null ? request.getMaxAttempts() : 0);
        quiz.setIsPublished(request.getIsPublished());

        quiz = quizRepository.save(quiz);
        return mapToQuizResponse(quiz);
    }

    @Transactional(readOnly = true)
    public List<QuizResponse> getQuizzesByLesson(UUID lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        List<Quiz> quizzes;

        try {
            // Lấy thông tin người dùng hiện tại
            Users currentUser = getCurrentUser();
            String role = currentUser.getRole().getRoleName();

            // Kiểm tra: Nếu là Admin HOẶC là Giảng viên của chính khóa học này
            boolean isOwnerInstructor = role.equals("INSTRUCTOR") 
                && lesson.getModule().getCourse().getInstructor().getUserId().equals(currentUser.getUserId());

            if (role.equals("ADMIN") || isOwnerInstructor) {
                // -> Lấy TẤT CẢ (gọi hàm mới vừa thêm ở Bước 1)
                quizzes = quizRepository.findByLesson_LessonIdOrderByOrderIndex(lessonId);
            } else {
                // -> Các trường hợp khác: Chỉ lấy Quiz đã Public
                quizzes = quizRepository.findByLesson_LessonIdAndIsPublishedOrderByOrderIndex(lessonId, true);
            }
        } catch (Exception e) {
            // Nếu chưa đăng nhập hoặc có lỗi xác thực -> Mặc định chỉ cho xem cái đã Public
            quizzes = quizRepository.findByLesson_LessonIdAndIsPublishedOrderByOrderIndex(lessonId, true);
        }

        return quizzes.stream()
                .map(this::mapToQuizResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuizResponse getQuizById(UUID quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        // Allow instructors to access their own unpublished quizzes for editing
        if (!quiz.getIsPublished()) {
            Users currentUser = getCurrentUser();
            if (currentUser.getRole().getRoleName().equals("INSTRUCTOR")) {
                // Check if the current instructor owns this course
                if (!quiz.getCourse().getInstructor().getUserId().equals(currentUser.getUserId())) {
                    throw new RuntimeException("Quiz is not published");
                }
            } else {
                throw new RuntimeException("Quiz is not published");
            }
        }

        return mapToQuizResponse(quiz);
    }

    @Transactional
    public boolean deleteQuestion(UUID questionId) {
        if (!questionRepository.existsById(questionId)) {
            throw new RuntimeException("Question not found");
        }
        questionRepository.deleteById(questionId);
        return true;
    }

    @Transactional
    public QuizAttemptResponse startQuizAttempt(UUID quizId) {
        UUID userId = getCurrentUserId();
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        if (!quiz.getIsPublished()) {
            throw new RuntimeException("Quiz is not published");
        }

        // Check max attempts
        List<QuizAttempt> previousAttempts = quizAttemptRepository.findByUserAndQuizOrderByAttemptNumberDesc(user, quiz);
        if (quiz.getMaxAttempts() != null && previousAttempts.size() >= quiz.getMaxAttempts()) {
            throw new RuntimeException("Maximum attempts reached");
        }

        int attemptNumber = previousAttempts.isEmpty() ? 1 : previousAttempts.get(0).getAttemptNumber() + 1;

        // Calculate max score
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
        
        return mapToQuizAttemptResponse(attempt);
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

        // Calculate correctness and points
        boolean isCorrect = false;
        Integer pointsAwarded = 0;

        if (question.getType() == Question.QuestionType.SHORT_ANSWER) {
            // For short answer, manual grading needed (for now, mark as incorrect)
            isCorrect = false;
        } else if (selectedAnswer != null) {
            isCorrect = selectedAnswer.getIsCorrect();
            pointsAwarded = isCorrect ? question.getPoints() : 0;
        }

        QuizAnswer quizAnswer = QuizAnswer.builder()
                .attempt(attempt)
                .question(question)
                .selectedAnswers(selectedAnswer != null ? List.of(selectedAnswer) : List.of())
                .textAnswer(request.getUserAnswer())
                .isCorrect(isCorrect)
                .pointsEarned(pointsAwarded)
                .build();

        quizAnswer = quizAnswerRepository.save(quizAnswer);
        return mapToQuizAnswerResponse(quizAnswer);
    }

    @Transactional
    public QuizAttemptResponse finishQuizAttempt(UUID attemptId) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Quiz attempt not found"));

        if (attempt.getStatus() != QuizAttempt.AttemptStatus.IN_PROGRESS) {
            throw new RuntimeException("Quiz attempt is not in progress");
        }

        // Calculate total score
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
        return mapToQuizAttemptResponse(attempt);
    }

    @Transactional(readOnly = true)
    public List<QuizAttemptResponse> getMyQuizAttempts(UUID quizId) {
        UUID userId = getCurrentUserId();
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        List<QuizAttempt> attempts = quizAttemptRepository.findByUserAndQuizOrderByAttemptNumberDesc(user, quiz);
        return attempts.stream()
                .map(this::mapToQuizAttemptResponse)
                .collect(Collectors.toList());
    }

    private QuizResponse mapToQuizResponse(Quiz quiz) {
        List<QuestionResponse> questions = quiz.getQuestions() != null
                ? quiz.getQuestions().stream()
                        .map(this::mapToQuestionResponse)
                        .collect(Collectors.toList())
                : List.of();

        return QuizResponse.builder()
                .quizId(quiz.getQuizId())
                .courseId(quiz.getCourse().getCourseId())
                .moduleId(quiz.getModule() != null ? quiz.getModule().getModuleId() : null)
                .lessonId(quiz.getLesson() != null ? quiz.getLesson().getLessonId() : null)
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .passingScore(quiz.getPassingScore())
                .timeLimit(quiz.getTimeLimit())
                .maxAttempts(quiz.getMaxAttempts())
                .isPublished(quiz.getIsPublished())
                .orderIndex(quiz.getOrderIndex())
                .questions(questions)
                .build();
    }

    private QuestionResponse mapToQuestionResponse(Question question) {
        List<AnswerResponse> answers = question.getAnswers() != null
                ? question.getAnswers().stream()
                        .map(this::mapToAnswerResponse)
                        .collect(Collectors.toList())
                : List.of();

        return QuestionResponse.builder()
                .questionId(question.getQuestionId())
                .quizId(question.getQuiz().getQuizId())
                .questionType(question.getType())
                .questionText(question.getQuestionText())
                .explanation(question.getExplanation())
                .points(question.getPoints())
                .orderIndex(question.getOrderIndex())
                .answers(answers)
                .build();
    }

    private AnswerResponse mapToAnswerResponse(Answer answer) {
        return AnswerResponse.builder()
                .answerId(answer.getAnswerId())
                .questionId(answer.getQuestion().getQuestionId())
                .answerText(answer.getAnswerText())
                .isCorrect(answer.getIsCorrect())
                .orderIndex(answer.getOrderIndex())
                .build();
    }

    private QuizAttemptResponse mapToQuizAttemptResponse(QuizAttempt attempt) {
        List<QuizAnswerResponse> userAnswers = quizAnswerRepository.findByAttempt(attempt).stream()
                .map(this::mapToQuizAnswerResponse)
                .collect(Collectors.toList());

        QuizResponse quizResponse = mapToQuizResponse(attempt.getQuiz());

        return QuizAttemptResponse.builder()
                .attemptId(attempt.getAttemptId())
                .userId(attempt.getUser().getUserId())
                .quiz(quizResponse)
                .attemptNumber(attempt.getAttemptNumber())
                .startTime(attempt.getStartedAt())
                .endTime(attempt.getSubmittedAt())
                .totalScore(attempt.getTotalScore())
                .maxScore(attempt.getMaxScore())
                .percentage(attempt.getPercentage())
                .status(attempt.getStatus())
                .passed(attempt.getPassed())
                .userAnswers(userAnswers)
                .build();
    }

    private QuizAnswerResponse mapToQuizAnswerResponse(QuizAnswer answer) {
        return QuizAnswerResponse.builder()
                .answerId(answer.getQuizAnswerId())
                .attemptId(answer.getAttempt().getAttemptId())
                .questionId(answer.getQuestion().getQuestionId())
                .selectedAnswerId(answer.getSelectedAnswers() != null && !answer.getSelectedAnswers().isEmpty()
                        ? answer.getSelectedAnswers().get(0).getAnswerId() : null)
                .userAnswer(answer.getTextAnswer())
                .isCorrect(answer.getIsCorrect())
                .pointsAwarded(answer.getPointsEarned())
                .build();
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return UUID.fromString(authentication.getName());
    }

    private Users getCurrentUser() {
        UUID userId = getCurrentUserId();
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
