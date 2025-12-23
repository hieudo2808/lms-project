package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.response.*;
import com.seikyuuressha.lms.entity.*;
import com.seikyuuressha.lms.repository.CourseRepository;
import com.seikyuuressha.lms.repository.EnrollmentRepository;
import com.seikyuuressha.lms.repository.ProgressRepository;
import com.seikyuuressha.lms.repository.UserRepository;
import com.seikyuuressha.lms.repository.VideoRepository; 
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
    private final UserRepository userRepository;
    private final VideoRepository videoRepository;

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

        // [FIX QUAN TRỌNG] Kiểm tra quyền xem khóa học chưa xuất bản
        checkCourseAccess(course);

        return mapToCourseResponse(course, getCurrentUserId());
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourseBySlug(String slug) {
        Course course = courseRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // [FIX QUAN TRỌNG] Kiểm tra quyền xem khóa học chưa xuất bản
        checkCourseAccess(course);

        return mapToCourseResponse(course, getCurrentUserId());
    }

    // === HÀM PHỤ ĐỂ CHECK QUYỀN (Logic mới) ===
    private void checkCourseAccess(Course course) {
        if (!course.isPublished()) {
            UUID currentUserId = getCurrentUserId();
            // Nếu là giảng viên của khóa học này thì cho phép xem
            boolean isOwner = currentUserId != null && course.getInstructor().getUserId().equals(currentUserId);
            
            if (!isOwner) {
                throw new RuntimeException("Course is not published");
            }
        }
    }

    private UUID getCurrentUserId() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null || authentication.getPrincipal() == null) {
        return null;
    }

    if (authentication.getPrincipal() instanceof UUID) {
        return (UUID) authentication.getPrincipal(); // ✅ ĐÚNG
    }

    return null;
}

    private CourseResponse mapToCourseResponseWithoutModules(Course course) {
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
                .coInstructors(mapToCoInstructorResponses(course))
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

        List<ModuleResponse> modules = new ArrayList<>();
        if (course.getModules() != null) {
            modules = course.getModules().stream()
                    .sorted(Comparator.comparingInt(com.seikyuuressha.lms.entity.Module::getSortOrder)) // [ĐÚNG: sortOrder]
                    .map(module -> mapToModuleResponse(module, isEnrolled, progressMap))
                    .collect(Collectors.toList());
        }

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
                .coInstructors(mapToCoInstructorResponses(course))
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
        if (module.getLessons() != null) {
            lessons = module.getLessons().stream()
                    .sorted(Comparator.comparingInt(Lesson::getSortOrder)) // [ĐÚNG: sortOrder]
                    .map(lesson -> mapToLessonResponse(lesson, isEnrolled, progressMap))
                    .collect(Collectors.toList());
        }

        return ModuleResponse.builder()
                .moduleId(module.getModuleId())
                .title(module.getTitle())
                .order(module.getSortOrder()) // [ĐÚNG: sortOrder]
                .lessons(lessons)
                .build();
    }

    private LessonResponse mapToLessonResponse(Lesson lesson, boolean isEnrolled, 
                                               Map<UUID, Double> progressMap) {
        String videoUrl = null;
        if (isEnrolled) {
            // Check if video exists in Video table with COMPLETED status
            var videoOpt = videoRepository.findByLesson_LessonId(lesson.getLessonId());
            if (videoOpt.isPresent() && videoOpt.get().getProcessingStatus() == Video.ProcessingStatus.COMPLETED) {
                // Return marker for frontend to call getVideoStreamUrl
                videoUrl = "stream:" + lesson.getLessonId().toString();
            } else {
                // Fallback to old videoUrl field
                videoUrl = lesson.getVideoUrl();
            }
        }
        
        return LessonResponse.builder()
                .lessonId(lesson.getLessonId())
                .title(lesson.getTitle())
                .videoUrl(videoUrl)
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

    private List<CoInstructorResponse> mapToCoInstructorResponses(Course course) {
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
}
