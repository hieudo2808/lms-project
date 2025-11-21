package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.response.*;
import com.seikyuuressha.lms.entity.*;
import com.seikyuuressha.lms.repository.CourseRepository;
import com.seikyuuressha.lms.repository.EnrollmentRepository;
import com.seikyuuressha.lms.repository.ProgressRepository;
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
        if (authentication != null && authentication.isAuthenticated()) {
            authentication.getPrincipal();
        }
        return null; // Will be populated from user context
    }

    private CourseResponse mapToCourseResponseWithoutModules(Course course) {
        return CourseResponse.builder()
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

        List<ModuleResponse> modules = course.getModules().stream()
                .sorted(Comparator.comparingInt(com.seikyuuressha.lms.entity.Module::getOrder))
                .map(module -> mapToModuleResponse(module, isEnrolled, progressMap))
                .collect(Collectors.toList());

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
                .totalDuration(calculateTotalDuration(course))
                .build();
    }

    private ModuleResponse mapToModuleResponse(com.seikyuuressha.lms.entity.Module module, 
                                               boolean isEnrolled, 
                                               Map<UUID, Double> progressMap) {
        List<LessonResponse> lessons = module.getLessons().stream()
                .sorted(Comparator.comparingInt(Lesson::getOrder))
                .map(lesson -> mapToLessonResponse(lesson, isEnrolled, progressMap))
                .collect(Collectors.toList());

        return ModuleResponse.builder()
                .moduleId(module.getModuleId())
                .title(module.getTitle())
                .order(module.getOrder())
                .lessons(lessons)
                .build();
    }

    private LessonResponse mapToLessonResponse(Lesson lesson, boolean isEnrolled, 
                                               Map<UUID, Double> progressMap) {
        return LessonResponse.builder()
                .lessonId(lesson.getLessonId())
                .title(lesson.getTitle())
                .videoUrl(isEnrolled ? lesson.getVideoUrl() : null) // Hide video URL for non-enrolled
                .content(lesson.getContent())
                .durationSeconds(lesson.getDurationSeconds())
                .order(lesson.getOrder())
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

    private Integer calculateTotalLessons(Course course) {
        return course.getModules().stream()
                .mapToInt(module -> module.getLessons().size())
                .sum();
    }

    private Integer calculateTotalDuration(Course course) {
        return course.getModules().stream()
                .flatMap(module -> module.getLessons().stream())
                .mapToInt(lesson -> lesson.getDurationSeconds() != null ? lesson.getDurationSeconds() : 0)
                .sum();
    }
}
