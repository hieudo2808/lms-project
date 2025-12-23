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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
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

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getPrincipal() == null) {
            throw new RuntimeException("Unauthorized");
        }

        UUID userId = (UUID) authentication.getPrincipal();

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.isPublished()) {
            throw new RuntimeException("Cannot enroll in unpublished course");
        }

        if (enrollmentRepository.existsByUser_UserIdAndCourse_CourseId(userId, courseId)) {
            throw new RuntimeException("Already enrolled in this course");
        }

        Enrollment enrollment = Enrollment.builder()
                .enrollmentId(UUID.randomUUID())
                .user(user)
                .course(course)
                .enrolledAt(OffsetDateTime.now())
                .progressPercent(0.0)
                .build();

        enrollmentRepository.save(enrollment);

        return mapToEnrollmentResponse(enrollment);
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getMyEnrollments() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getPrincipal() == null) {
            throw new RuntimeException("Unauthorized");
        }

        UUID userId = (UUID) authentication.getPrincipal();

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Enrollment> enrollments =
                enrollmentRepository.findByUser_UserId(user.getUserId());

        return enrollments.stream()
                .map(this::mapToEnrollmentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isEnrolled(UUID courseId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getPrincipal() == null) {
            return false;
        }

        UUID userId = (UUID) authentication.getPrincipal();

        return enrollmentRepository
                .existsByUser_UserIdAndCourse_CourseId(userId, courseId);
    }

    private EnrollmentResponse mapToEnrollmentResponse(Enrollment enrollment) {

        CourseResponse courseResponse =
                courseService.getCourseById(
                        enrollment.getCourse().getCourseId()
                );

        return EnrollmentResponse.builder()
                .enrollmentId(enrollment.getEnrollmentId())
                .course(courseResponse)
                .enrolledAt(enrollment.getEnrolledAt())
                .progressPercent(
                        enrollment.getProgressPercent() != null
                                ? enrollment.getProgressPercent()
                                : 0.0
                )
                .build();
    }
}
