package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.request.*;
import com.seikyuuressha.lms.dto.response.*;
import com.seikyuuressha.lms.entity.*;
import com.seikyuuressha.lms.entity.Module;
import com.seikyuuressha.lms.mapper.LessonMapper;
import com.seikyuuressha.lms.mapper.UserMapper;
import com.seikyuuressha.lms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InstructorService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final ModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PaymentRepository paymentRepository;
    private final ProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final CourseInstructorRepository courseInstructorRepository;
    private final RoleRepository roleRepository;
    private final VideoRepository videoRepository;
    private final QuizRepository quizRepository;
    private final UserMapper userMapper;
    private final LessonMapper lessonMapper;

    // ==================== COURSE MANAGEMENT ====================

    /**
     * Create a new course
     */
    @Transactional
    public CourseResponse createCourse(CreateCourseRequest request) {
        Users instructor = getCurrentInstructor();

        // Check if slug already exists
        if (courseRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Course slug already exists");
        }

        // Get category
        Categories category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Course course = Course.builder()
                .title(request.getTitle())
                .slug(request.getSlug())
                .description(request.getDescription())
                .thumbnailUrl(request.getThumbnailUrl())
                .level(request.getLevel())
                .price(request.getPrice())
                .category(category)
                .instructor(instructor)
                .isPublished(false) // Default unpublished
                .build();

        course = courseRepository.save(course);
        log.info("Course created. CourseId: {}, Instructor: {}", course.getCourseId(), instructor.getEmail());

        return mapToCourseResponse(course);
    }

    /**
     * Update existing course
     */
    @Transactional
    public CourseResponse updateCourse(UUID courseId, UpdateCourseRequest request) {
        Course course = getCourseByIdAndVerifyOwnership(courseId);

        if (request.getTitle() != null) {
            course.setTitle(request.getTitle());
        }
        if (request.getSlug() != null) {
            if (!course.getSlug().equals(request.getSlug()) && courseRepository.existsBySlug(request.getSlug())) {
                throw new RuntimeException("Course slug already exists");
            }
            course.setSlug(request.getSlug());
        }
        if (request.getDescription() != null) {
            course.setDescription(request.getDescription());
        }
        if (request.getThumbnailUrl() != null) {
            course.setThumbnailUrl(request.getThumbnailUrl());
        }
        if (request.getLevel() != null) {
            course.setLevel(request.getLevel());
        }
        if (request.getPrice() != null) {
            course.setPrice(request.getPrice());
        }
        if (request.getCategoryId() != null) {
            Categories category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            course.setCategory(category);
        }

        course.setUpdatedAt(OffsetDateTime.now());
        course = courseRepository.save(course);

        return mapToCourseResponse(course);
    }

    /**
     * Delete course
     */
    @Transactional
    public Boolean deleteCourse(UUID courseId) {
        Course course = getCourseByIdAndVerifyOwnership(courseId);

        // Check if course has enrollments
        if (enrollmentRepository.existsByCourse_CourseId(courseId)) {
            throw new RuntimeException("Cannot delete course with existing enrollments");
        }

        courseRepository.delete(course);
        log.info("Course deleted. CourseId: {}", courseId);
        return true;
    }

    /**
     * Publish course
     */
    @Transactional
    public CourseResponse publishCourse(UUID courseId) {
        Course course = getCourseByIdAndVerifyOwnership(courseId);

        // Validate course has content
        if (course.getModules().isEmpty()) {
            throw new RuntimeException("Cannot publish course without modules");
        }

        boolean hasContent = course.getModules().stream()
                .anyMatch(module -> !module.getLessons().isEmpty());

        if (!hasContent) {
            throw new RuntimeException("Cannot publish course without lessons");
        }

        course.setPublished(true);
        course.setUpdatedAt(OffsetDateTime.now());
        course = courseRepository.save(course);

        log.info("Course published. CourseId: {}", courseId);
        return mapToCourseResponse(course);
    }

    /**
     * Unpublish course
     */
    @Transactional
    public CourseResponse unpublishCourse(UUID courseId) {
        Course course = getCourseByIdAndVerifyOwnership(courseId);

        course.setPublished(false);
        course.setUpdatedAt(OffsetDateTime.now());
        course = courseRepository.save(course);

        log.info("Course unpublished. CourseId: {}", courseId);
        return mapToCourseResponse(course);
    }

    /**
     * Get instructor's courses
     */
    @Transactional(readOnly = true)
    public List<CourseResponse> getMyCourses() {
        Users instructor = getCurrentInstructor();
        List<Course> courses = courseRepository.findByInstructor_UserId(instructor.getUserId());

        return courses.stream()
                .map(this::mapToCourseResponse)
                .collect(Collectors.toList());
    }

    // ==================== MODULE MANAGEMENT ====================

    /**
     * Create module
     */
    @Transactional
    public ModuleResponse createModule(CreateModuleRequest request) {
        Course course = getCourseByIdAndVerifyOwnership(request.getCourseId());

        // Determine order
        int order = request.getOrder() != null ? request.getOrder() :
                course.getModules().size() + 1;

        Module module = Module.builder()
                .course(course)
                .title(request.getTitle())
                .sortOrder(order)
                .build();

        module = moduleRepository.save(module);
        log.info("Module created. ModuleId: {}, CourseId: {}", module.getModuleId(), course.getCourseId());

        return mapToModuleResponse(module);
    }

    /**
     * Update module
     */
    @Transactional
    public ModuleResponse updateModule(UUID moduleId, UpdateModuleRequest request) {
        Module module = getModuleByIdAndVerifyOwnership(moduleId);

        if (request.getTitle() != null) {
            module.setTitle(request.getTitle());
        }
        if (request.getOrder() != null) {
            module.setSortOrder(request.getOrder());
        }

        module = moduleRepository.save(module);
        return mapToModuleResponse(module);
    }

    /**
     * Delete module
     */
    @Transactional
    public Boolean deleteModule(UUID moduleId) {
        Module module = getModuleByIdAndVerifyOwnership(moduleId);

        // Check if module has lessons
        if (!module.getLessons().isEmpty()) {
            throw new RuntimeException("Cannot delete module with existing lessons");
        }

        moduleRepository.delete(module);
        log.info("Module deleted. ModuleId: {}", moduleId);
        return true;
    }

    /**
     * Reorder modules
     */
    @Transactional
    public List<ModuleResponse> reorderModules(UUID courseId, List<UUID> moduleIds) {
        Course course = getCourseByIdAndVerifyOwnership(courseId);

        List<Module> modules = moduleRepository.findAllById(moduleIds);
        
        // Verify all modules belong to this course
        boolean allBelongToCourse = modules.stream()
                .allMatch(m -> m.getCourse().getCourseId().equals(courseId));
        
        if (!allBelongToCourse) {
            throw new RuntimeException("Some modules do not belong to this course");
        }

        // Update order
        for (int i = 0; i < moduleIds.size(); i++) {
            UUID moduleId = moduleIds.get(i);
            Module module = modules.stream()
                    .filter(m -> m.getModuleId().equals(moduleId))
                    .findFirst()
                    .orElseThrow();
            module.setSortOrder(i + 1);
        }

        moduleRepository.saveAll(modules);

        return modules.stream()
                .sorted(Comparator.comparingInt(Module::getSortOrder))
                .map(this::mapToModuleResponse)
                .collect(Collectors.toList());
    }

    // ==================== LESSON MANAGEMENT ====================

    /**
     * Create lesson
     */
    @Transactional
    public LessonResponse createLesson(CreateLessonRequest request) {
        Module module = getModuleByIdAndVerifyOwnership(request.getModuleId());

        // Determine order
        int order = request.getOrder() != null ? request.getOrder() :
                module.getLessons().size() + 1;

        Lesson lesson = Lesson.builder()
                .module(module)
                .title(request.getTitle())
                .content(request.getContent())
                .durationSeconds(request.getDurationSeconds())
                .sortOrder(order)
                .build();

        lesson = lessonRepository.save(lesson);
        log.info("Lesson created. LessonId: {}, ModuleId: {}", lesson.getLessonId(), module.getModuleId());

        return lessonMapper.toLessonResponseSimple(lesson);
    }

    /**
     * Update lesson
     */
    @Transactional
    public LessonResponse updateLesson(UUID lessonId, UpdateLessonRequest request) {
        Lesson lesson = getLessonByIdAndVerifyOwnership(lessonId);

        if (request.getTitle() != null) {
            lesson.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            lesson.setContent(request.getContent());
        }
        if (request.getDurationSeconds() != null) {
            lesson.setDurationSeconds(request.getDurationSeconds());
        }
        if (request.getOrder() != null) {
            lesson.setSortOrder(request.getOrder());
        }

        lesson = lessonRepository.save(lesson);
        return lessonMapper.toLessonResponseSimple(lesson);
    }

    /**
     * Delete lesson
     */
    @Transactional
    public Boolean deleteLesson(UUID lessonId) {
        Lesson lesson = getLessonByIdAndVerifyOwnership(lessonId);

        // Check if lesson has progress records
        if (progressRepository.existsByLesson_LessonId(lessonId)) {
            throw new RuntimeException("Cannot delete lesson with student progress");
        }

        // Cascade delete quiz-related data in correct order (due to FK NO ACTION constraints)
        // 1. Delete QuizAnswerSelections (join table)
        quizRepository.deleteQuizAnswerSelectionsByLessonId(lessonId);
        // 2. Delete QuizAnswers
        quizRepository.deleteQuizAnswersByLessonId(lessonId);
        // 3. Delete QuizAttempts
        quizRepository.deleteQuizAttemptsByLessonId(lessonId);
        // 4. Delete Answers
        quizRepository.deleteAnswersByLessonId(lessonId);
        // 5. Delete Questions
        quizRepository.deleteQuestionsByLessonId(lessonId);
        // 6. Delete Quizzes
        quizRepository.deleteByLesson_LessonId(lessonId);
        log.info("Deleted quiz cascade for lesson. LessonId: {}", lessonId);

        // Delete associated video
        videoRepository.findByLesson_LessonId(lessonId).ifPresent(video -> {
            videoRepository.delete(video);
            log.info("Deleted video for lesson. VideoId: {}", video.getVideoId());
        });

        lessonRepository.delete(lesson);
        log.info("Lesson deleted. LessonId: {}", lessonId);
        return true;
    }

    /**
     * Reorder lessons
     */
    @Transactional
    public List<LessonResponse> reorderLessons(UUID moduleId, List<UUID> lessonIds) {
        Module module = getModuleByIdAndVerifyOwnership(moduleId);

        List<Lesson> lessons = lessonRepository.findAllById(lessonIds);
        
        // Verify all lessons belong to this module
        boolean allBelongToModule = lessons.stream()
                .allMatch(l -> l.getModule().getModuleId().equals(moduleId));
        
        if (!allBelongToModule) {
            throw new RuntimeException("Some lessons do not belong to this module");
        }

        // Update order
        for (int i = 0; i < lessonIds.size(); i++) {
            UUID lessonId = lessonIds.get(i);
            Lesson lesson = lessons.stream()
                    .filter(l -> l.getLessonId().equals(lessonId))
                    .findFirst()
                    .orElseThrow();
            lesson.setSortOrder(i + 1);
        }

        lessonRepository.saveAll(lessons);

        return lessons.stream()
                .sorted(Comparator.comparingInt(Lesson::getSortOrder))
                .map(lessonMapper::toLessonResponseSimple)
                .collect(Collectors.toList());
    }

    // ==================== DASHBOARD QUERIES ====================

    /**
     * Get course enrollments
     */
    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getCourseEnrollments(UUID courseId) {
        Course course = getCourseByIdAndVerifyOwnership(courseId);

        List<Enrollment> enrollments = enrollmentRepository.findByCourse_CourseId(courseId);

        return enrollments.stream()
                .map(this::mapToEnrollmentResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get course revenue
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getCourseRevenue(UUID courseId) {
        Course course = getCourseByIdAndVerifyOwnership(courseId);

        List<Payment> payments = paymentRepository.findByCourse_CourseIdAndPaymentStatus(
                courseId, "SUCCESS");  // Original DB value

        BigDecimal totalRevenue = payments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalEnrollments = enrollmentRepository.countByCourse_CourseId(courseId);

        Map<String, Object> revenue = new HashMap<>();
        revenue.put("courseId", courseId);
        revenue.put("totalRevenue", totalRevenue);
        revenue.put("totalEnrollments", totalEnrollments);
        revenue.put("totalPayments", payments.size());
        revenue.put("averagePrice", totalEnrollments > 0 ? 
                totalRevenue.divide(BigDecimal.valueOf(totalEnrollments), 2, java.math.RoundingMode.HALF_UP) : 
                BigDecimal.ZERO);

        return revenue;
    }

    /**
     * Get student progress for a course
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentProgress(UUID courseId) {
        Course course = getCourseByIdAndVerifyOwnership(courseId);

        List<Enrollment> enrollments = enrollmentRepository.findByCourse_CourseId(courseId);
        List<Lesson> allLessons = lessonRepository.findByCourseId(courseId);
        int totalLessons = allLessons.size();

        return enrollments.stream()
                .map(enrollment -> {
                    Map<String, Object> studentData = new HashMap<>();
                    studentData.put("userId", enrollment.getUser().getUserId());
                    studentData.put("fullName", enrollment.getUser().getFullName());
                    studentData.put("email", enrollment.getUser().getEmail());
                    studentData.put("enrolledAt", enrollment.getEnrolledAt());

                    // Calculate progress dynamically from lesson progress
                    UUID userId = enrollment.getUser().getUserId();
                    long completedLessons = allLessons.stream()
                            .filter(lesson -> {
                                Progress progress = progressRepository
                                        .findByUser_UserIdAndLesson_LessonId(userId, lesson.getLessonId())
                                        .orElse(null);
                                return progress != null && progress.getProgressPercent() >= 80;
                            })
                            .count();

                    double progressPercent = totalLessons > 0
                            ? (double) completedLessons / totalLessons * 100
                            : 0.0;

                    studentData.put("progressPercent", progressPercent);
                    studentData.put("completedLessons", completedLessons);
                    studentData.put("totalLessons", totalLessons);

                    return studentData;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get total unique students count across all instructor's courses
     */
    @Transactional(readOnly = true)
    public long getTotalStudentsCount() {
        Users instructor = getCurrentInstructor();
        List<Course> courses = courseRepository.findByInstructor_UserId(instructor.getUserId());
        
        return courses.stream()
                .flatMap(course -> enrollmentRepository.findByCourse_CourseId(course.getCourseId()).stream())
                .map(enrollment -> enrollment.getUser().getUserId())
                .distinct()
                .count();
    }

    // ==================== HELPER METHODS ====================

    private Users getCurrentInstructor() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null || authentication.getPrincipal() == null) {
        throw new RuntimeException("Unauthorized");
    }

    UUID userId = (UUID) authentication.getPrincipal();

    Users user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    if (!"INSTRUCTOR".equals(user.getRole().getRoleName()) &&
        !"ADMIN".equals(user.getRole().getRoleName())) {
        throw new RuntimeException("User is not an instructor");
    }

    return user;
}

    private Course getCourseByIdAndVerifyOwnership(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Users currentUser = getCurrentInstructor();
        if (!course.getInstructor().getUserId().equals(currentUser.getUserId()) &&
            !"ADMIN".equals(currentUser.getRole().getRoleName())) {
            throw new RuntimeException("You are not the instructor of this course");
        }

        return course;
    }

    private Module getModuleByIdAndVerifyOwnership(UUID moduleId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found"));

        Users currentUser = getCurrentInstructor();
        if (!module.getCourse().getInstructor().getUserId().equals(currentUser.getUserId()) &&
            !"ADMIN".equals(currentUser.getRole().getRoleName())) {
            throw new RuntimeException("You are not the instructor of this course");
        }

        return module;
    }

    private Lesson getLessonByIdAndVerifyOwnership(UUID lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        Users currentUser = getCurrentInstructor();
        if (!lesson.getModule().getCourse().getInstructor().getUserId().equals(currentUser.getUserId()) &&
            !"ADMIN".equals(currentUser.getRole().getRoleName())) {
            throw new RuntimeException("You are not the instructor of this course");
        }

        return lesson;
    }

    // ==================== CO-INSTRUCTOR MANAGEMENT ====================

    /**
     * Add a co-instructor to a course (only owner can add)
     */
    @Transactional
    public CoInstructorResponse addCoInstructor(UUID courseId, String email) {
        Course course = getCourseByIdAndVerifyOwnership(courseId);
        Users currentUser = getCurrentInstructor();

        // Only course owner can add co-instructors
        if (!course.getInstructor().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Chỉ chủ khóa học mới có thể thêm giảng viên phụ");
        }

        // Find user by email
        Users coInstructor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email: " + email));

        // Check if user is an instructor
        if (!"INSTRUCTOR".equals(coInstructor.getRole().getRoleName()) &&
            !"ADMIN".equals(coInstructor.getRole().getRoleName())) {
            throw new RuntimeException("Người dùng không phải là giảng viên");
        }

        // Check if already a co-instructor
        if (courseInstructorRepository.existsByCourseIdAndUserId(courseId, coInstructor.getUserId())) {
            throw new RuntimeException("Người dùng đã là giảng viên của khóa học này");
        }

        // Cannot add yourself
        if (coInstructor.getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Không thể thêm chính mình làm giảng viên phụ");
        }

        CourseInstructor courseInstructor = CourseInstructor.builder()
                .courseId(courseId)
                .userId(coInstructor.getUserId())
                .userRole(CourseInstructor.InstructorRole.CO_INSTRUCTOR)
                .addedAt(java.time.OffsetDateTime.now())
                .build();

        courseInstructorRepository.save(courseInstructor);
        log.info("Co-instructor added. CourseId: {}, CoInstructor: {}", courseId, email);

        return mapToCoInstructorResponse(courseInstructor, coInstructor);
    }

    /**
     * Remove a co-instructor from a course (only owner can remove)
     */
    @Transactional
    public boolean removeCoInstructor(UUID courseId, UUID userId) {
        Course course = getCourseByIdAndVerifyOwnership(courseId);
        Users currentUser = getCurrentInstructor();

        // Only course owner can remove co-instructors  
        if (!course.getInstructor().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Chỉ chủ khóa học mới có thể xóa giảng viên phụ");
        }

        // Cannot remove the owner
        if (course.getInstructor().getUserId().equals(userId)) {
            throw new RuntimeException("Không thể xóa chủ khóa học");
        }

        CourseInstructor ci = courseInstructorRepository.findByCourseIdAndUserId(courseId, userId)
                .orElseThrow(() -> new RuntimeException("Giảng viên không tồn tại trong khóa học này"));

        courseInstructorRepository.delete(ci);
        log.info("Co-instructor removed. CourseId: {}, UserId: {}", courseId, userId);

        return true;
    }

    /**
     * Check if current user has access to course (owner or co-instructor)
     */
    private boolean hasCourseAccess(Course course, Users user) {
        // Check if owner
        if (course.getInstructor().getUserId().equals(user.getUserId())) {
            return true;
        }
        // Check if admin
        if ("ADMIN".equals(user.getRole().getRoleName())) {
            return true;
        }
        // Check if co-instructor
        return courseInstructorRepository.existsByCourseIdAndUserId(
            course.getCourseId(), user.getUserId());
    }

    private CoInstructorResponse mapToCoInstructorResponse(CourseInstructor ci, Users user) {
        return CoInstructorResponse.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .role(ci.getUserRole().name())
                .addedAt(ci.getAddedAt())
                .build();
    }

    private Integer calculateTotalLessons(Course course) {
        if (course.getModules() == null) {
            return 0;
        }
        return course.getModules().stream()
                .mapToInt(module -> module.getLessons() != null ? module.getLessons().size() : 0)
                .sum();
    }

    private CourseResponse mapToCourseResponse(Course course) {
        List<ModuleResponse> modules = course.getModules() != null 
                ? course.getModules().stream()
                        .sorted(Comparator.comparingInt(Module::getSortOrder))
                        .map(this::mapToModuleResponse)
                        .collect(Collectors.toList())
                : Collections.emptyList();

        return CourseResponse.builder()
                .courseId(course.getCourseId())
                .title(course.getTitle())
                .slug(course.getSlug())
                .description(course.getDescription())
                .thumbnailUrl(course.getThumbnailUrl())
                .level(course.getLevel())
                .price(course.getPrice())
                .categoryName(course.getCategory() != null ? course.getCategory().getName() : null)
                .instructor(userMapper.toInstructorResponse(course.getInstructor()))
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .isPublished(course.isPublished())
                .modules(modules)
                .totalLessons(calculateTotalLessons(course))
                .build();
    }

    private ModuleResponse mapToModuleResponse(Module module) {
        List<LessonResponse> lessons = module.getLessons() != null
                ? module.getLessons().stream()
                        .sorted(Comparator.comparingInt(Lesson::getSortOrder))
                        .map(lesson -> {
                            LessonResponse response = lessonMapper.toLessonResponseSimple(lesson);
                            // Check if video exists for this lesson (for instructor view)
                            var videoOpt = videoRepository.findByLesson_LessonId(lesson.getLessonId());
                            if (videoOpt.isPresent()) {
                                // Set indicator that video exists (actual or processing)
                                response.setVideoUrl("video:" + lesson.getLessonId());
                            }
                            return response;
                        })
                        .collect(Collectors.toList())
                : Collections.emptyList();

        return ModuleResponse.builder()
                .moduleId(module.getModuleId())
                .title(module.getTitle())
                .order(module.getSortOrder())
                .lessons(lessons)
                .build();
    }

    private EnrollmentResponse mapToEnrollmentResponse(Enrollment enrollment) {
        return EnrollmentResponse.builder()
                .enrollmentId(enrollment.getEnrollmentId())
                .course(mapToCourseResponse(enrollment.getCourse()))
                .enrolledAt(enrollment.getEnrolledAt())
                .progressPercent(enrollment.getProgressPercent())
                .build();
    }
}
