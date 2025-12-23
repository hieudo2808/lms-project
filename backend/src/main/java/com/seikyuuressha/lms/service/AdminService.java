package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.response.*;
import com.seikyuuressha.lms.entity.*;
import com.seikyuuressha.lms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PaymentRepository paymentRepository;

    // ==================== USER MANAGEMENT ====================

    /**
     * Get all users with pagination
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers(Integer page, Integer limit, String roleName) {
        verifyAdmin();

        // Convert 1-based page to 0-based index
        int pageIndex = (page != null && page > 0) ? page - 1 : 0;
        int pageSize = (limit != null && limit > 0) ? limit : 20;

        Pageable pageable = PageRequest.of(
                pageIndex,
                pageSize,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<Users> usersPage;
        if (roleName != null && !roleName.isEmpty()) {
            usersPage = userRepository.findByRole_RoleName(roleName, pageable);
        } else {
            usersPage = userRepository.findAll(pageable);
        }

        return usersPage.getContent().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update user role
     */
    @Transactional
    public UserResponse updateUserRole(UUID userId, UUID roleId) {
        verifyAdmin();

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Roles role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        user.setRole(role);
        user = userRepository.save(user);

        log.info("User role updated. UserId: {}, NewRole: {}", userId, role.getRoleName());
        return mapToUserResponse(user);
    }

    /**
     * Lock user account
     */
    @Transactional
    public Boolean lockUser(UUID userId, String reason) {
        verifyAdmin();

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("ADMIN".equals(user.getRole().getRoleName())) {
            throw new RuntimeException("Cannot lock admin user");
        }

        user.setActive(false);
        userRepository.save(user);

        log.info("User locked. UserId: {}, Reason: {}", userId, reason);
        return true;
    }

    /**
     * Unlock user account
     */
    @Transactional
    public Boolean unlockUser(UUID userId) {
        verifyAdmin();

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setActive(true);
        userRepository.save(user);

        log.info("User unlocked. UserId: {}", userId);
        return true;
    }

    /**
     * Delete user (soft delete by deactivating)
     */
    @Transactional
    public Boolean deleteUser(UUID userId) {
        verifyAdmin();

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("ADMIN".equals(user.getRole().getRoleName())) {
            throw new RuntimeException("Cannot delete admin user");
        }

        // Check if user has enrollments or created content
        boolean hasEnrollments = enrollmentRepository.existsByUser_UserId(userId);
        boolean hasCourses = !courseRepository.findByInstructor_UserId(userId).isEmpty();

        if (hasEnrollments || hasCourses) {
            // Soft delete by deactivating
            user.setActive(false);
            userRepository.save(user);
            log.info("User soft deleted (deactivated). UserId: {}", userId);
        } else {
            // Hard delete if no dependencies
            userRepository.delete(user);
            log.info("User hard deleted. UserId: {}", userId);
        }

        return true;
    }

    // ==================== COURSE MODERATION ====================

    /**
     * Get all courses (admin view)
     */
    @Transactional(readOnly = true)
    public List<CourseResponse> getAllCoursesAdmin(Boolean isPublished, Integer page, Integer limit) {
        verifyAdmin();

        // Convert 1-based page to 0-based index
        int pageIndex = (page != null && page > 0) ? page - 1 : 0;
        int pageSize = (limit != null && limit > 0) ? limit : 20;

        Pageable pageable = PageRequest.of(
                pageIndex,
                pageSize,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<Course> coursesPage;
        if (isPublished != null) {
            coursesPage = courseRepository.findByIsPublished(isPublished, pageable);
        } else {
            coursesPage = courseRepository.findAll(pageable);
        }

        return coursesPage.getContent().stream()
                .map(this::mapToCourseResponse)
                .collect(Collectors.toList());
    }

    /**
     * Approve course (publish)
     */
    @Transactional
    public CourseResponse approveCourse(UUID courseId) {
        verifyAdmin();

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        course.setPublished(true);
        course.setUpdatedAt(LocalDateTime.now());
        course = courseRepository.save(course);

        log.info("Course approved by admin. CourseId: {}", courseId);
        return mapToCourseResponse(course);
    }

    /**
     * Reject course (unpublish)
     */
    @Transactional
    public CourseResponse rejectCourse(UUID courseId, String reason) {
        verifyAdmin();

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        course.setPublished(false);
        course.setUpdatedAt(LocalDateTime.now());
        course = courseRepository.save(course);

        log.info("Course rejected by admin. CourseId: {}, Reason: {}", courseId, reason);
        return mapToCourseResponse(course);
    }

    /**
     * Delete course (admin override)
     */
    @Transactional
    public Boolean deleteCourseAdmin(UUID courseId) {
        verifyAdmin();

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Admin can delete even with enrollments (after warning)
        courseRepository.delete(course);
        log.info("Course deleted by admin. CourseId: {}", courseId);
        return true;
    }

    // ==================== SYSTEM REPORTS ====================

    /**
     * Get system statistics
     */
    @Transactional(readOnly = true)
    public SystemStatisticsResponse getSystemStatistics() {
        verifyAdmin();

        long totalUsers = userRepository.count();
        long totalInstructors = userRepository.countByRole_RoleName("INSTRUCTOR");
        long totalStudents = userRepository.countByRole_RoleName("STUDENT");
        long totalCourses = courseRepository.count();
        long publishedCourses = courseRepository.countByIsPublished(true);
        long unpublishedCourses = courseRepository.countByIsPublished(false);
        long totalEnrollments = enrollmentRepository.count();
        long totalPayments = paymentRepository.count();

        List<Payment> completedPayments = paymentRepository.findByPaymentStatus("SUCCESS");
        BigDecimal totalRevenue = completedPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long completedPaymentsCount = completedPayments.size();
        long pendingPayments = paymentRepository.findByPaymentStatus("PENDING").size();
        long failedPayments = paymentRepository.findByPaymentStatus("FAILED").size();

        return SystemStatisticsResponse.builder()
                .totalUsers(totalUsers)
                .totalInstructors(totalInstructors)
                .totalStudents(totalStudents)
                .totalCourses(totalCourses)
                .publishedCourses(publishedCourses)
                .unpublishedCourses(unpublishedCourses)
                .totalEnrollments(totalEnrollments)
                .totalPayments(totalPayments)
                .totalRevenue(totalRevenue)
                .completedPayments(completedPaymentsCount)
                .pendingPayments(pendingPayments)
                .failedPayments(failedPayments)
                .build();
    }

    /**
     * Get revenue report
     */
    @Transactional(readOnly = true)
    public RevenueReportResponse getRevenueReport(LocalDateTime startDate, LocalDateTime endDate) {
        verifyAdmin();

        if (startDate == null) {
            startDate = LocalDateTime.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        List<Payment> allPayments = paymentRepository.findByCreatedAtBetween(startDate, endDate);

        List<Payment> completedPayments = allPayments.stream()
                .filter(p -> "SUCCESS".equals(p.getPaymentStatus()))
                .collect(Collectors.toList());

        BigDecimal totalRevenue = completedPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalPayments = allPayments.size();
        long completedCount = completedPayments.size();
        long pendingCount = allPayments.stream()
                .filter(p -> "PENDING".equals(p.getPaymentStatus()))
                .count();
        long failedCount = allPayments.stream()
                .filter(p -> "FAILED".equals(p.getPaymentStatus()))
                .count();

        BigDecimal averagePayment = completedCount > 0 ?
                totalRevenue.divide(BigDecimal.valueOf(completedCount), 2, java.math.RoundingMode.HALF_UP) :
                BigDecimal.ZERO;

        return RevenueReportResponse.builder()
                .totalRevenue(totalRevenue)
                .totalPayments(totalPayments)
                .completedPayments(completedCount)
                .pendingPayments(pendingCount)
                .failedPayments(failedCount)
                .averagePayment(averagePayment)
                .startDate(startDate)
                .endDate(endDate)
                .build();
    }

    /**
     * Get all payments (admin view)
     */
    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments(Integer page, Integer limit, String status) {
        verifyAdmin();

        // Convert 1-based page to 0-based index
        int pageIndex = (page != null && page > 0) ? page - 1 : 0;
        int pageSize = (limit != null && limit > 0) ? limit : 20;

        Pageable pageable = PageRequest.of(
                pageIndex,
                pageSize,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<Payment> paymentsPage;
        if (status != null && !status.isEmpty()) {
            // Map to original DB values: SUCCESS, PENDING, FAILED
            String paymentStatus = status.toUpperCase();
            paymentsPage = paymentRepository.findByPaymentStatus(paymentStatus, pageable);
        } else {
            paymentsPage = paymentRepository.findAll(pageable);
        }

        return paymentsPage.getContent().stream()
                .map(this::mapToPaymentResponse)
                .collect(Collectors.toList());
    }

    // ==================== HELPER METHODS ====================

    private void verifyAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"ADMIN".equals(user.getRole().getRoleName())) {
            throw new RuntimeException("Access denied. Admin role required.");
        }
    }

    private UserResponse mapToUserResponse(Users user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .roleName(user.getRole().getRoleName())
                .createdAt(user.getCreatedAt() != null
                    ? user.getCreatedAt().atOffset(ZoneOffset.UTC)
                    : null)
                .isActive(user.isActive())
                .build();
    }

    private CourseResponse mapToCourseResponse(Course course) {
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
                .createdAt(
                    course.getCreatedAt() != null
                    ? course.getCreatedAt().atOffset(ZoneOffset.UTC)
                    : null)
                .updatedAt(
                    course.getUpdatedAt() != null
                    ? course.getUpdatedAt().atOffset(ZoneOffset.UTC)
                    : null)
                .isPublished(course.isPublished())
                .build();
    }

    private InstructorResponse mapToInstructorResponse(Users instructor) {
        return InstructorResponse.builder()
                .userId(instructor.getUserId())
                .fullName(instructor.getFullName())
                .email(instructor.getEmail())
                .avatarUrl(instructor.getAvatarUrl())
                .bio(instructor.getBio())
                .build();
    }

    private PaymentResponse mapToPaymentResponse(Payment payment) {
        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .userId(payment.getUser().getUserId())
                .courseId(payment.getCourse().getCourseId())
                .enrollmentId(payment.getEnrollment() != null ? payment.getEnrollment().getEnrollmentId() : null)
                .amount(payment.getAmount())
                .paymentProvider(payment.getPaymentMethod())
                .transactionId(payment.getTransactionId())
                .paymentStatus(payment.getPaymentStatus())
                .paidAt(payment.getPaidAt() != null
                    ? payment.getPaidAt().atOffset(ZoneOffset.UTC)
                    : null)
                .createdAt(payment.getCreatedAt() != null
                    ? payment.getCreatedAt().atOffset(ZoneOffset.UTC)
                    : null)
                .build();
    }
}
