package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.response.*;
import com.seikyuuressha.lms.entity.*;
import com.seikyuuressha.lms.repository.CourseRepository;
import com.seikyuuressha.lms.repository.EnrollmentRepository;
import com.seikyuuressha.lms.repository.ProgressRepository;
import com.seikyuuressha.lms.repository.UserRepository; 
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ProgressRepository progressRepository;
    private final UserRepository userRepository; // Inject User Repo

    @Transactional(readOnly = true)
    public List<CourseResponse> getAllPublishedCourses(UUID categoryId) {
        List<Course> courses = categoryId == null 
                ? courseRepository.findByIsPublishedTrue()
                : courseRepository.findPublishedCourses(categoryId);

        return courses.stream()
                .map(this::mapToCourseResponseWithoutModules)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourseById(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.isPublished()) {
            throw new RuntimeException("Course is not published");
        }

        return mapToCourseResponse(course, getCurrentUserId());
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourseBySlug(String slug) {
        Course course = courseRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.isPublished()) {
            throw new RuntimeException("Course is not published");
        }

        return mapToCourseResponse(course, getCurrentUserId());
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() 
                && !authentication.getPrincipal().equals("anonymousUser")) {
            String email = authentication.getName();
            // Lấy ID từ DB thay vì ép kiểu Principal
            return userRepository.findByEmail(email)
                    .map(Users::getUserId)
                    .orElse(null);
        }
        return null;
    }

    private CourseResponse mapToCourseResponseWithoutModules(Course course) {
        return CourseResponse.builder()
                .courseId(course.getCourseId()) // Thêm dòng này nếu DTO có ID
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
                .totalLessons(calculateTotalLessons(course))
                .totalDuration(calculateTotalDuration(course))
                .build();
    }

    private CourseResponse mapToCourseResponse(Course course, UUID userId) {
        boolean isEnrolled = userId != null && 
                enrollmentRepository.existsByUser_UserIdAndCourse_CourseId(userId, course.getCourseId());

        Map<UUID, Double> progressMap = new HashMap<>();
        if (userId != null) {
            List<Progress> progresses = progressRepository
                    .findByUser_UserIdAndLesson_Module_Course_CourseId(userId, course.getCourseId());
            progresses.forEach(p -> progressMap.put(p.getLesson().getLessonId(), p.getProgressPercent()));
        }

        // [FIX NULL] Kiểm tra modules có null không trước khi stream
        List<ModuleResponse> modules = new ArrayList<>();
        if (course.getModules() != null) {
            modules = course.getModules().stream()
                    .sorted(Comparator.comparingInt(com.seikyuuressha.lms.entity.Module::getSortOrder))
                    .map(module -> mapToModuleResponse(module, isEnrolled, progressMap))
                    .collect(Collectors.toList());
        }

        return CourseResponse.builder()
                .courseId(course.getCourseId()) // Thêm dòng này
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
                .totalDuration(calculateTotalDuration(course))
                .build();
    }

    private ModuleResponse mapToModuleResponse(com.seikyuuressha.lms.entity.Module module, 
                                               boolean isEnrolled, 
                                               Map<UUID, Double> progressMap) {
        List<LessonResponse> lessons = new ArrayList<>();
        // [FIX NULL] Kiểm tra lessons trong module
        if (module.getLessons() != null) {
            lessons = module.getLessons().stream()
                    .sorted(Comparator.comparingInt(Lesson::getSortOrder))
                    .map(lesson -> mapToLessonResponse(lesson, isEnrolled, progressMap))
                    .collect(Collectors.toList());
        }

        return ModuleResponse.builder()
                .moduleId(module.getModuleId())
                .title(module.getTitle())
                .order(module.getSortOrder())
                .lessons(lessons)
                .build();
    }

    private LessonResponse mapToLessonResponse(Lesson lesson, boolean isEnrolled, 
                                               Map<UUID, Double> progressMap) {
        return LessonResponse.builder()
                .lessonId(lesson.getLessonId())
                .title(lesson.getTitle())
                .videoUrl(isEnrolled ? lesson.getVideoUrl() : null)
                .content(lesson.getContent())
                .durationSeconds(lesson.getDurationSeconds())
                .order(lesson.getSortOrder())
                .userProgress(progressMap.getOrDefault(lesson.getLessonId(), 0.0))
                .build();
    }

    private InstructorResponse mapToInstructorResponse(Users instructor) {
        if (instructor == null) return null;
        
        return InstructorResponse.builder()
                .userId(instructor.getUserId())
                .fullName(instructor.getFullName())
                .email(instructor.getEmail())
                .avatarUrl(instructor.getAvatarUrl())
                .bio(instructor.getBio())
                .build();
    }

    // [FIX NULL] Sửa logic tính toán an toàn hơn
    private Integer calculateTotalLessons(Course course) {
        if (course.getModules() == null) return 0;
        return course.getModules().stream()
                .mapToInt(module -> (module.getLessons() != null) ? module.getLessons().size() : 0)
                .sum();
    }

    private Integer calculateTotalDuration(Course course) {
        if (course.getModules() == null) return 0;
        return course.getModules().stream()
                .filter(m -> m.getLessons() != null)
                .flatMap(module -> module.getLessons().stream())
                .mapToInt(lesson -> lesson.getDurationSeconds() != null ? lesson.getDurationSeconds() : 0)
                .sum();
    }
}
