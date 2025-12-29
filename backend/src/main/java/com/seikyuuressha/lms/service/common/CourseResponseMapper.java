package com.seikyuuressha.lms.service.common;

import com.seikyuuressha.lms.dto.response.*;
import com.seikyuuressha.lms.entity.*;
import com.seikyuuressha.lms.entity.Module;
import com.seikyuuressha.lms.mapper.UserMapper;
import com.seikyuuressha.lms.repository.EnrollmentRepository;
import com.seikyuuressha.lms.repository.ProgressRepository;
import com.seikyuuressha.lms.repository.CourseInstructorRepository;
import com.seikyuuressha.lms.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseResponseMapper {

    private final UserMapper userMapper;
    private final EnrollmentRepository enrollmentRepository;
    private final ProgressRepository progressRepository;
    private final CourseInstructorRepository courseInstructorRepository;
    private final VideoRepository videoRepository;

    
    public Integer calculateTotalLessons(Course course) {
        if (course.getModules() == null) return 0;
        return course.getModules().stream()
                .mapToInt(m -> m.getLessons() != null ? m.getLessons().size() : 0)
                .sum();
    }

    
    public Integer calculateTotalDuration(Course course) {
        if (course.getModules() == null) return 0;
        return course.getModules().stream()
                .filter(m -> m.getLessons() != null)
                .flatMap(m -> m.getLessons().stream())
                .mapToInt(l -> l.getDurationSeconds() != null ? l.getDurationSeconds() : 0)
                .sum();
    }

    
    public CourseResponse toCourseResponseForStudent(Course course, UUID userId) {
        boolean isEnrolled = userId != null && 
                enrollmentRepository.existsByUser_UserIdAndCourse_CourseId(userId, course.getCourseId());
        
        boolean isInstructor = userId != null && (
                course.getInstructor().getUserId().equals(userId) ||
                courseInstructorRepository.existsByCourseIdAndUserId(course.getCourseId(), userId)
        );
        
        boolean canSeeVideo = isEnrolled || isInstructor;
        Map<UUID, Double> progressMap = getProgressMap(userId, course);

        List<ModuleResponse> modules = course.getModules() != null
                ? course.getModules().stream()
                        .sorted(Comparator.comparingInt(Module::getSortOrder))
                        .map(m -> toModuleResponse(m, canSeeVideo, progressMap))
                        .collect(Collectors.toList())
                : Collections.emptyList();

        return buildCourseResponse(course)
                .modules(modules)
                .build();
    }

    
    public CourseResponse toCourseResponseForInstructor(Course course) {
        List<ModuleResponse> modules = course.getModules() != null
                ? course.getModules().stream()
                        .sorted(Comparator.comparingInt(Module::getSortOrder))
                        .map(this::toModuleResponseSimple)
                        .collect(Collectors.toList())
                : Collections.emptyList();

        return buildCourseResponse(course)
                .modules(modules)
                .build();
    }

    
    public CourseResponse toCourseResponseWithoutModules(Course course) {
        return buildCourseResponse(course).build();
    }

    
    private CourseResponse.CourseResponseBuilder buildCourseResponse(Course course) {
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
                .coInstructors(mapCoInstructors(course))
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .isPublished(course.isPublished())
                .totalLessons(calculateTotalLessons(course))
                .totalDuration(calculateTotalDuration(course));
    }

    
    public ModuleResponse toModuleResponse(Module module, boolean canSeeVideo, Map<UUID, Double> progressMap) {
        List<LessonResponse> lessons = module.getLessons() != null
                ? module.getLessons().stream()
                        .sorted(Comparator.comparingInt(Lesson::getSortOrder))
                        .map(l -> toLessonResponse(l, canSeeVideo, progressMap))
                        .collect(Collectors.toList())
                : Collections.emptyList();

        return ModuleResponse.builder()
                .moduleId(module.getModuleId())
                .title(module.getTitle())
                .order(module.getSortOrder())
                .lessons(lessons)
                .build();
    }

    
    public ModuleResponse toModuleResponseSimple(Module module) {
        List<LessonResponse> lessons = module.getLessons() != null
                ? module.getLessons().stream()
                        .sorted(Comparator.comparingInt(Lesson::getSortOrder))
                        .map(this::toLessonResponseSimple)
                        .collect(Collectors.toList())
                : Collections.emptyList();

        return ModuleResponse.builder()
                .moduleId(module.getModuleId())
                .title(module.getTitle())
                .order(module.getSortOrder())
                .lessons(lessons)
                .build();
    }

    
    public LessonResponse toLessonResponse(Lesson lesson, boolean canSeeVideo, Map<UUID, Double> progressMap) {
        String videoUrl = null;
        if (canSeeVideo) {
            boolean hasVideo = videoRepository.existsByLesson_LessonId(lesson.getLessonId());
            if (hasVideo) {
                videoUrl = "stream:" + lesson.getLessonId();
            }
        }

        Double progress = progressMap.getOrDefault(lesson.getLessonId(), 0.0);

        return LessonResponse.builder()
                .lessonId(lesson.getLessonId())
                .title(lesson.getTitle())
                .content(lesson.getContent())
                .order(lesson.getSortOrder())
                .durationSeconds(lesson.getDurationSeconds())
                .videoUrl(videoUrl)
                .userProgress(progress)
                .build();
    }

    
    public LessonResponse toLessonResponseSimple(Lesson lesson) {
        boolean hasVideo = videoRepository.existsByLesson_LessonId(lesson.getLessonId());
        String videoUrl = hasVideo ? "stream:" + lesson.getLessonId() : null;

        return LessonResponse.builder()
                .lessonId(lesson.getLessonId())
                .title(lesson.getTitle())
                .content(lesson.getContent())
                .order(lesson.getSortOrder())
                .durationSeconds(lesson.getDurationSeconds())
                .videoUrl(videoUrl)
                .build();
    }

    
    public List<CoInstructorResponse> mapCoInstructors(Course course) {
        if (course.getCourseInstructors() == null) {
            return Collections.emptyList();
        }
        return course.getCourseInstructors().stream()
                .map(ci -> CoInstructorResponse.builder()
                        .userId(ci.getUserId())
                        .fullName(ci.getUser() != null ? ci.getUser().getFullName() : "")
                        .email(ci.getUser() != null ? ci.getUser().getEmail() : "")
                        .avatarUrl(ci.getUser() != null ? ci.getUser().getAvatarUrl() : null)
                        .role(ci.getUserRole().name())
                        .addedAt(ci.getAddedAt())
                        .build())
                .collect(Collectors.toList());
    }

    
    private Map<UUID, Double> getProgressMap(UUID userId, Course course) {
        if (userId == null) return Collections.emptyMap();
        
        List<Progress> progressList = progressRepository.findByUser_UserIdAndLesson_Module_Course_CourseId(userId, course.getCourseId());
        return progressList.stream()
                .collect(Collectors.toMap(
                        p -> p.getLesson().getLessonId(),
                        Progress::getProgressPercent,
                        (a, b) -> b
                ));
    }
}
