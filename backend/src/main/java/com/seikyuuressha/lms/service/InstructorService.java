package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.request.*;
import com.seikyuuressha.lms.dto.response.*;
import com.seikyuuressha.lms.entity.*;
import com.seikyuuressha.lms.entity.Module;
import com.seikyuuressha.lms.repository.*;
import com.seikyuuressha.lms.entity.*;
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
                .videoUrl(request.getVideoUrl())
                .durationSeconds(request.getDurationSeconds())
                .sortOrder(order)
                .build();

        lesson = lessonRepository.save(lesson);
        log.info("Lesson created. LessonId: {}, ModuleId: {}", lesson.getLessonId(), module.getModuleId());

        return mapToLessonResponse(lesson);
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
        if (request.getVideoUrl() != null) {
            lesson.setVideoUrl(request.getVideoUrl());
        }
        if (request.getDurationSeconds() != null) {
            lesson.setDurationSeconds(request.getDurationSeconds());
        }
        if (request.getOrder() != null) {
            lesson.setSortOrder(request.getOrder());
        }

        lesson = lessonRepository.save(lesson);
        return mapToLessonResponse(lesson);
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
                .map(this::mapToLessonResponse)
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

        return enrollments.stream()
                .map(enrollment -> {
                    Map<String, Object> studentData = new HashMap<>();
                    studentData.put("userId", enrollment.getUser().getUserId());
                    studentData.put("fullName", enrollment.getUser().getFullName());
                    studentData.put("email", enrollment.getUser().getEmail());
                    studentData.put("enrolledAt", enrollment.getEnrolledAt());
                    studentData.put("progressPercent", enrollment.getProgressPercent());

                    // Get lesson progress
                    List<Progress> progresses = progressRepository
                            .findByUser_UserIdAndLesson_Module_Course_CourseId(
                                    enrollment.getUser().getUserId(), courseId);
                    
                    long completedLessons = progresses.stream()
                            .filter(p -> p.getProgressPercent() >= 100.0)
                            .count();
                    
                    studentData.put("completedLessons", completedLessons);
                    studentData.put("totalLessons", calculateTotalLessons(course));

                    return studentData;
                })
                .collect(Collectors.toList());
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
                .instructor(mapToInstructorResponse(course.getInstructor()))
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
                        .map(this::mapToLessonResponse)
                        .collect(Collectors.toList())
                : Collections.emptyList();

        return ModuleResponse.builder()
                .moduleId(module.getModuleId())
                .title(module.getTitle())
                .order(module.getSortOrder())
                .lessons(lessons)
                .build();
    }

    private LessonResponse mapToLessonResponse(Lesson lesson) {
        return LessonResponse.builder()
                .lessonId(lesson.getLessonId())
                .title(lesson.getTitle())
                .videoUrl(lesson.getVideoUrl())
                .content(lesson.getContent())
                .durationSeconds(lesson.getDurationSeconds())
                .order(lesson.getSortOrder())
                .build();
    }

    private InstructorResponse mapToInstructorResponse(Users instructor) {
        return InstructorResponse.builder()
                .userId(instructor.getUserId())
                .fullName(instructor.getFullName())
                .email(instructor.getEmail())
                .avatarUrl(instructor.getAvatarUrl())
                .bio(instructor.getBio())
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
