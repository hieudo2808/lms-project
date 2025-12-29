ackage com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.response.*;
import com.seikyuuressha.lms.entity.*;
import com.seikyuuressha.lms.repository.CourseRepository;
import com.seikyuuressha.lms.repository.CourseInstructorRepository;
import com.seikyuuressha.lms.service.common.CourseResponseMapper;
import com.seikyuuressha.lms.service.common.SecurityContextService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseInstructorRepository courseInstructorRepository;
    private final CourseResponseMapper courseResponseMapper;
    private final SecurityContextService securityContextService;

    @Transactional(readOnly = true)
    public List<CourseResponse> getAllPublishedCourses(UUID categoryId) {
        List<Course> courses = categoryId == null 
                ? courseRepository.findByIsPublishedTrue()
                : courseRepository.findPublishedCourses(categoryId);

        return courses.stream()
                .map(courseResponseMapper::toCourseResponseWithoutModules)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourseById(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        checkCourseAccess(course);

        return courseResponseMapper.toCourseResponseForStudent(
                course, 
                securityContextService.getOptionalCurrentUserId()
        );
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourseBySlug(String slug) {
        Course course = courseRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        checkCourseAccess(course);

        return courseResponseMapper.toCourseResponseForStudent(
                course, 
                securityContextService.getOptionalCurrentUserId()
        );
    }

    
    private void checkCourseAccess(Course course) {
        if (!course.isPublished()) {
            UUID currentUserId = securityContextService.getOptionalCurrentUserId();
            if (currentUserId == null) {
                throw new RuntimeException("Course is not published");
            }
            
            if (securityContextService.hasRole("ADMIN")) {
                return;
            }
            
            boolean isOwner = course.getInstructor().getUserId().equals(currentUserId);
            
            boolean isCoInstructor = courseInstructorRepository
                    .findByCourseIdAndUserId(course.getCourseId(), currentUserId)
                    .isPresent();
            
            if (!isOwner && !isCoInstructor) {
                throw new RuntimeException("Course is not published");
            }
        }
    }
}
