package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.request.*;
import com.seikyuuressha.lms.dto.response.*;
import com.seikyuuressha.lms.entity.*;
import com.seikyuuressha.lms.entity.Module;
import com.seikyuuressha.lms.mapper.LessonMapper;
import com.seikyuuressha.lms.mapper.UserMapper;
import com.seikyuuressha.lms.repository.*;
import com.seikyuuressha.lms.service.common.SecurityContextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for Instructor course management operations.
 * Module/Lesson operations moved to ModuleService/LessonService.
 * Revenue operations moved to RevenueService.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InstructorService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final CourseInstructorRepository courseInstructorRepository;
    private final VideoRepository videoRepository;
    private final SecurityContextService securityContextService;
    private final UserMapper userMapper;
    private final LessonMapper lessonMapper;

    // ==================== COURSE MANAGEMENT ====================

    /**
     * Create a new course
     */
    @Transactional
    public CourseResponse createCourse(CreateCourseRequest request) {
        Users instructor = securityContextService.getCurrentInstructor();

        if (courseRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Course slug already exists");
        }

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
                .isPublished(false)
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
     * Get instructor's courses (including courses where user is co-instructor)
     */
    @Transactional(readOnly = true)
    public List<CourseResponse> getMyCourses() {
        Users instructor = securityContextService.getCurrentInstructor();
        UUID userId = instructor.getUserId();
        
        // Get courses where user is primary instructor
        List<Course> ownedCourses = courseRepository.findByInstructor_UserId(userId);
        
        // Get courses where user is co-instructor
        List<CourseInstructor> coInstructorEntries = courseInstructorRepository.findByUserId(userId);
        List<Course> coInstructorCourses = coInstructorEntries.stream()
                .map(ci -> courseRepository.findById(ci.getCourseId()).orElse(null))
                .filter(course -> course != null)
                .collect(Collectors.toList());
        
        // Combine and deduplicate
        java.util.Set<UUID> seenIds = new java.util.HashSet<>();
        List<Course> allCourses = new java.util.ArrayList<>();
        
        for (Course course : ownedCourses) {
            if (seenIds.add(course.getCourseId())) {
                allCourses.add(course);
            }
        }
        for (Course course : coInstructorCourses) {
            if (seenIds.add(course.getCourseId())) {
                allCourses.add(course);
            }
        }

        return allCourses.stream()
                .map(this::mapToCourseResponse)
                .collect(Collectors.toList());
    }

    // ==================== CO-INSTRUCTOR MANAGEMENT ====================

    /**
     * Add a co-instructor to a course
     */
    @Transactional
    public CoInstructorResponse addCoInstructor(UUID courseId, String email) {
        Course course = getCourseByIdAndVerifyOwnership(courseId);
        Users currentUser = securityContextService.getCurrentInstructor();

        if (!course.getInstructor().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Chỉ chủ khóa học mới có thể thêm giảng viên phụ");
        }

        Users coInstructor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email: " + email));

        if (!"INSTRUCTOR".equals(coInstructor.getRole().getRoleName()) &&
            !"ADMIN".equals(coInstructor.getRole().getRoleName())) {
            throw new RuntimeException("Người dùng không phải là giảng viên");
        }

        if (courseInstructorRepository.existsByCourseIdAndUserId(courseId, coInstructor.getUserId())) {
            throw new RuntimeException("Người dùng đã là giảng viên của khóa học này");
        }

        if (coInstructor.getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Không thể thêm chính mình làm giảng viên phụ");
        }

        CourseInstructor courseInstructor = CourseInstructor.builder()
                .courseId(courseId)
                .userId(coInstructor.getUserId())
                .userRole(CourseInstructor.InstructorRole.CO_INSTRUCTOR)
                .addedAt(OffsetDateTime.now())
                .build();

        courseInstructorRepository.save(courseInstructor);
        log.info("Co-instructor added. CourseId: {}, CoInstructor: {}", courseId, email);

        return mapToCoInstructorResponse(courseInstructor, coInstructor);
    }

    /**
     * Remove a co-instructor from a course
     */
    @Transactional
    public boolean removeCoInstructor(UUID courseId, UUID userId) {
        Course course = getCourseByIdAndVerifyOwnership(courseId);
        Users currentUser = securityContextService.getCurrentInstructor();

        if (!course.getInstructor().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Chỉ chủ khóa học mới có thể xóa giảng viên phụ");
        }

        if (course.getInstructor().getUserId().equals(userId)) {
            throw new RuntimeException("Không thể xóa chủ khóa học");
        }

        CourseInstructor ci = courseInstructorRepository.findByCourseIdAndUserId(courseId, userId)
                .orElseThrow(() -> new RuntimeException("Giảng viên không tồn tại trong khóa học này"));

        courseInstructorRepository.delete(ci);
        log.info("Co-instructor removed. CourseId: {}, UserId: {}", courseId, userId);

        return true;
    }

    // ==================== ENROLLMENT MANAGEMENT ====================

    /**
     * Get course enrollments
     */
    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getCourseEnrollments(UUID courseId) {
        getCourseByIdAndVerifyOwnership(courseId);

        List<Enrollment> enrollments = enrollmentRepository.findByCourse_CourseId(courseId);
        return enrollments.stream()
                .map(this::mapToEnrollmentResponse)
                .collect(Collectors.toList());
    }

    /**
     * Remove a student from a course
     */
    @Transactional
    public boolean removeStudentFromCourse(UUID courseId, UUID userId) {
        getCourseByIdAndVerifyOwnership(courseId);
        
        Enrollment enrollment = enrollmentRepository.findByUser_UserIdAndCourse_CourseId(userId, courseId)
                .orElseThrow(() -> new RuntimeException("Student is not enrolled in this course"));
        
        progressRepository.deleteByUser_UserIdAndLesson_Module_Course_CourseId(userId, courseId);
        enrollmentRepository.delete(enrollment);
        
        log.info("Student {} removed from course {} by instructor", userId, courseId);
        return true;
    }

    // ==================== HELPER METHODS ====================

    public Course getCourseByIdAndVerifyOwnership(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Users currentUser = securityContextService.getCurrentInstructor();
        UUID userId = currentUser.getUserId();
        
        // Check if user is primary instructor, co-instructor, or admin
        boolean isPrimaryInstructor = course.getInstructor().getUserId().equals(userId);
        boolean isCoInstructor = courseInstructorRepository.existsByCourseIdAndUserId(courseId, userId);
        boolean isAdmin = "ADMIN".equals(currentUser.getRole().getRoleName());
        
        if (!isPrimaryInstructor && !isCoInstructor && !isAdmin) {
            throw new RuntimeException("You are not the instructor of this course");
        }

        return course;
    }

    // ==================== MAPPING METHODS ====================

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
                            var videoOpt = videoRepository.findByLesson_LessonId(lesson.getLessonId());
                            if (videoOpt.isPresent()) {
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
