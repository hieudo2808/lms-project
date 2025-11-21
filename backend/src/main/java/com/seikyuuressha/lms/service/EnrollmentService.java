package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.response.CourseResponse;
import com.seikyuuressha.lms.dto.response.EnrollmentResponse;
import com.seikyuuressha.lms.entity.Course;
import com.seikyuuressha.lms.entity.Enrollment;
import com.seikyuuressha.lms.entity.Users;
import com.seikyuuressha.lms.repository.CourseRepository;
import com.seikyuuressha.lms.repository.EnrollmentRepository;
import com.seikyuuressha.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CourseService courseService;

    @Transactional
    public EnrollmentResponse enrollCourse(UUID courseId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.isPublished()) {
            throw new RuntimeException("Cannot enroll in unpublished course");
        }

        // Check if already enrolled
        if (enrollmentRepository.existsByUser_UserIdAndCourse_CourseId(user.getUserId(), courseId)) {
            throw new RuntimeException("Already enrolled in this course");
        }

        Enrollment enrollment = Enrollment.builder()
                .enrollmentId(UUID.randomUUID())
                .user(user)
                .course(course)
                .enrolledAt(LocalDateTime.now())
                .progressPercent(0.0)
                .build();

        enrollmentRepository.save(enrollment);

        return mapToEnrollmentResponse(enrollment);
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getMyEnrollments() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Enrollment> enrollments = enrollmentRepository.findByUser_UserId(user.getUserId());
        
        return enrollments.stream()
                .map(this::mapToEnrollmentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isEnrolled(UUID courseId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return enrollmentRepository.existsByUser_UserIdAndCourse_CourseId(user.getUserId(), courseId);
    }

    private EnrollmentResponse mapToEnrollmentResponse(Enrollment enrollment) {
        CourseResponse courseResponse = courseService.getCourseById(enrollment.getCourse().getCourseId());
        
        return EnrollmentResponse.builder()
                .course(courseResponse)
                .enrolledAt(enrollment.getEnrolledAt())
                .progressPercent(enrollment.getProgressPercent())
                .build();
    }
}
