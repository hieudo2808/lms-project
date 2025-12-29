package com.seikyuuressha.lms.service.admin;

import com.seikyuuressha.lms.dto.response.CourseResponse;
import com.seikyuuressha.lms.entity.Course;
import com.seikyuuressha.lms.mapper.CourseMapper;
import com.seikyuuressha.lms.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseApprovalService {

    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;

    
    @Transactional(readOnly = true)
    public List<CourseResponse> getAllCoursesAdmin(Boolean isPublished, Integer page, Integer limit) {
        int pageIndex = (page != null && page > 0) ? page - 1 : 0;
        int pageSize = (limit != null && limit > 0) ? limit : 20;

        Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Course> coursesPage;
        if (isPublished != null) {
            coursesPage = courseRepository.findByIsPublished(isPublished, pageable);
        } else {
            coursesPage = courseRepository.findAll(pageable);
        }

        return coursesPage.getContent().stream()
                .map(courseMapper::toCourseResponse)
                .collect(Collectors.toList());
    }

    
    @Transactional
    public CourseResponse approveCourse(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        course.setPublished(true);
        course.setUpdatedAt(OffsetDateTime.now());
        course = courseRepository.save(course);

        log.info("Course approved by admin. CourseId: {}", courseId);
        return courseMapper.toCourseResponse(course);
    }

    
    @Transactional
    public CourseResponse rejectCourse(UUID courseId, String reason) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        course.setPublished(false);
        course.setUpdatedAt(OffsetDateTime.now());
        course = courseRepository.save(course);

        log.info("Course rejected by admin. CourseId: {}, Reason: {}", courseId, reason);
        return courseMapper.toCourseResponse(course);
    }

    
    @Transactional
    public Boolean deleteCourseAdmin(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        courseRepository.delete(course);
        log.info("Course deleted by admin. CourseId: {}", courseId);
        return true;
    }
}
