package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.response.CourseResponse;
import com.seikyuuressha.lms.dto.response.EnrollmentResponse;
import com.seikyuuressha.lms.entity.Course;
import com.seikyuuressha.lms.entity.Enrollment;
import com.seikyuuressha.lms.entity.Lesson;
import com.seikyuuressha.lms.entity.Payment;
import com.seikyuuressha.lms.entity.Progress;
import com.seikyuuressha.lms.entity.Users;
import com.seikyuuressha.lms.repository.CourseRepository;
import com.seikyuuressha.lms.repository.EnrollmentRepository;
import com.seikyuuressha.lms.repository.LessonRepository;
import com.seikyuuressha.lms.repository.PaymentRepository;
import com.seikyuuressha.lms.repository.ProgressRepository;
import com.seikyuuressha.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CourseService courseService;
    private final ProgressRepository progressRepository;
    private final LessonRepository lessonRepository;
    private final PaymentRepository paymentRepository;

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

        // Lấy tất cả enrollment
        List<Enrollment> enrollments =
                enrollmentRepository.findByUser_UserId(user.getUserId());

        // Lọc chỉ những enrollment đã thanh toán thành công hoặc miễn phí
        return enrollments.stream()
                .filter(enrollment -> {
                    Optional<Payment> payment = paymentRepository
                            .findByEnrollment_EnrollmentId(enrollment.getEnrollmentId());
                    // Không có payment (free) hoặc payment SUCCESS
                    return !payment.isPresent() || "SUCCESS".equals(payment.get().getPaymentStatus());
                })
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

        // Kiểm tra enrollment có tồn tại không
        Optional<Enrollment> enrollmentOpt = enrollmentRepository
                .findByUser_UserIdAndCourse_CourseId(userId, courseId);
        
        if (!enrollmentOpt.isPresent()) {
            return false;
        }
        
        Enrollment enrollment = enrollmentOpt.get();
        
        // Kiểm tra payment có thành công không
        Optional<Payment> paymentOpt = paymentRepository
                .findByEnrollment_EnrollmentId(enrollment.getEnrollmentId());
        
        // Nếu không có payment (khóa học miễn phí) hoặc payment SUCCESS → được phép học
        return !paymentOpt.isPresent() || "SUCCESS".equals(paymentOpt.get().getPaymentStatus());
    }

    private EnrollmentResponse mapToEnrollmentResponse(Enrollment enrollment) {
        CourseResponse courseResponse =
                courseService.getCourseById(enrollment.getCourse().getCourseId());

        // Calculate progress dynamically from lesson progress
        UUID courseId = enrollment.getCourse().getCourseId();
        UUID userId = enrollment.getUser().getUserId();
        
        List<Lesson> allLessons = lessonRepository.findByCourseId(courseId);
        int totalLessons = allLessons.size();
        
        long completedLessons = 0;
        if (totalLessons > 0) {
            completedLessons = allLessons.stream()
                .filter(lesson -> {
                    Progress progress = progressRepository
                        .findByUser_UserIdAndLesson_LessonId(userId, lesson.getLessonId())
                        .orElse(null);
                    return progress != null && progress.getProgressPercent() >= 80;
                })
                .count();
        }
        
        double calculatedProgress = totalLessons > 0 
            ? (double) completedLessons / totalLessons * 100 
            : 0.0;

        return EnrollmentResponse.builder()
                .enrollmentId(enrollment.getEnrollmentId())
                .course(courseResponse)
                .enrolledAt(enrollment.getEnrolledAt())
                .progressPercent(calculatedProgress)
                .build();
    }
}
