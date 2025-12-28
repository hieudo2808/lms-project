package com.seikyuuressha.lms.service.analytics;

import com.seikyuuressha.lms.entity.*;
import com.seikyuuressha.lms.entity.Module;
import com.seikyuuressha.lms.repository.*;
import com.seikyuuressha.lms.service.common.SecurityContextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;

/**
 * Service for Revenue and Analytics operations.
 * Extracted from InstructorService to comply with Single Responsibility Principle.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RevenueService {

    private final PaymentRepository paymentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final ProgressRepository progressRepository;
    private final LessonRepository lessonRepository;
    private final CourseInstructorRepository courseInstructorRepository;
    private final SecurityContextService securityContextService;

    private static final String[] MONTH_NAMES = {"", "Thg 1", "Thg 2", "Thg 3", "Thg 4", "Thg 5", "Thg 6", 
                                                  "Thg 7", "Thg 8", "Thg 9", "Thg 10", "Thg 11", "Thg 12"};

    /**
     * Get revenue statistics for a specific course.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getCourseRevenue(UUID courseId) {
        Course course = getCourseByIdAndVerifyOwnership(courseId);

        List<Payment> payments = paymentRepository.findByCourse_CourseIdAndPaymentStatus(
                courseId, "SUCCESS");

        BigDecimal totalRevenue = payments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalEnrollments = enrollmentRepository.countByCourse_CourseId(courseId);

        Map<String, Object> revenue = new HashMap<>();
        revenue.put("courseId", courseId);
        revenue.put("totalRevenue", totalRevenue);
        revenue.put("totalEnrollments", totalEnrollments);
        revenue.put("totalPayments", payments.size());
        revenue.put("averagePrice", totalEnrollments > 0 ? 
                totalRevenue.divide(BigDecimal.valueOf(totalEnrollments), 2, RoundingMode.HALF_UP) : 
                BigDecimal.ZERO);

        return revenue;
    }

    /**
     * Get student progress for a course.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentProgress(UUID courseId) {
        Course course = getCourseByIdAndVerifyOwnership(courseId);

        List<Enrollment> enrollments = enrollmentRepository.findByCourse_CourseId(courseId);
        List<Lesson> allLessons = lessonRepository.findByCourseId(courseId);
        int totalLessons = allLessons.size();

        return enrollments.stream()
                .map(enrollment -> buildStudentProgressData(enrollment, allLessons, totalLessons))
                .collect(java.util.stream.Collectors.toList());
    }

    private Map<String, Object> buildStudentProgressData(Enrollment enrollment, List<Lesson> allLessons, int totalLessons) {
        Map<String, Object> studentData = new HashMap<>();
        studentData.put("userId", enrollment.getUser().getUserId());
        studentData.put("fullName", enrollment.getUser().getFullName());
        studentData.put("email", enrollment.getUser().getEmail());
        studentData.put("enrolledAt", enrollment.getEnrolledAt());

        UUID userId = enrollment.getUser().getUserId();
        long completedLessons = allLessons.stream()
                .filter(lesson -> {
                    Progress progress = progressRepository
                            .findByUser_UserIdAndLesson_LessonId(userId, lesson.getLessonId())
                            .orElse(null);
                    return progress != null && progress.getProgressPercent() >= 80;
                })
                .count();

        double progressPercent = totalLessons > 0
                ? (double) completedLessons / totalLessons * 100
                : 0.0;

        studentData.put("progressPercent", progressPercent);
        studentData.put("completedLessons", completedLessons);
        studentData.put("totalLessons", totalLessons);

        return studentData;
    }

    /**
     * Get total unique students count across all instructor's courses.
     */
    @Transactional(readOnly = true)
    public long getTotalStudentsCount() {
        Users instructor = securityContextService.getCurrentInstructor();
        UUID userId = instructor.getUserId();
        
        // Get owned courses
        List<Course> ownedCourses = courseRepository.findByInstructor_UserId(userId);
        
        // Get co-instructor courses
        List<CourseInstructor> coInstructorEntries = courseInstructorRepository.findByUserId(userId);
        List<Course> coInstructorCourses = coInstructorEntries.stream()
                .map(ci -> courseRepository.findById(ci.getCourseId()).orElse(null))
                .filter(course -> course != null)
                .collect(java.util.stream.Collectors.toList());
        
        // Combine all courses
        Set<UUID> seenCourseIds = new HashSet<>();
        List<Course> allCourses = new ArrayList<>();
        for (Course course : ownedCourses) {
            if (seenCourseIds.add(course.getCourseId())) {
                allCourses.add(course);
            }
        }
        for (Course course : coInstructorCourses) {
            if (seenCourseIds.add(course.getCourseId())) {
                allCourses.add(course);
            }
        }
        
        return allCourses.stream()
                .flatMap(course -> enrollmentRepository.findByCourse_CourseId(course.getCourseId()).stream())
                .map(enrollment -> enrollment.getUser().getUserId())
                .distinct()
                .count();
    }

    /**
     * Get monthly revenue for the last N months.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMonthlyRevenue(int months) {
        Users instructor = securityContextService.getCurrentInstructor();
        OffsetDateTime startDate = OffsetDateTime.now().minusMonths(months);
        
        List<Object[]> rawData = paymentRepository.getMonthlyRevenueByInstructor(
                instructor.getUserId(), startDate);
        
        return buildMonthlyRevenueList(rawData, months);
    }

    /**
     * Get monthly revenue for a specific course.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCourseMonthlyRevenue(UUID courseId, int months) {
        getCourseByIdAndVerifyOwnership(courseId);
        
        OffsetDateTime startDate = OffsetDateTime.now().minusMonths(months);
        List<Object[]> rawData = paymentRepository.getMonthlyRevenueByCourse(courseId, startDate);
        
        return buildMonthlyRevenueList(rawData, months);
    }

    private List<Map<String, Object>> buildMonthlyRevenueList(List<Object[]> rawData, int months) {
        Map<String, BigDecimal> revenueByMonth = new LinkedHashMap<>();
        
        // Initialize months with zero
        for (int i = months - 1; i >= 0; i--) {
            OffsetDateTime date = OffsetDateTime.now().minusMonths(i);
            int month = date.getMonthValue();
            int year = date.getYear();
            String key = MONTH_NAMES[month] + " " + year;
            revenueByMonth.put(key, BigDecimal.ZERO);
        }
        
        // Fill in actual data
        for (Object[] row : rawData) {
            int year = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();
            BigDecimal revenue = row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO;
            String key = MONTH_NAMES[month] + " " + year;
            if (revenueByMonth.containsKey(key)) {
                revenueByMonth.put(key, revenue);
            }
        }
        
        // Convert to list
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> entry : revenueByMonth.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("month", entry.getKey());
            item.put("revenue", entry.getValue().doubleValue());
            result.add(item);
        }
        
        return result;
    }

    /**
     * Get a course by ID with ownership verification.
     */
    private Course getCourseByIdAndVerifyOwnership(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Users currentUser = securityContextService.getCurrentInstructor();
        UUID userId = currentUser.getUserId();
        
        // Check if user is primary instructor, co-instructor, or admin
        boolean isPrimaryInstructor = course.getInstructor().getUserId().equals(userId);
        boolean isCoInstructor = courseInstructorRepository.existsByCourseIdAndUserId(courseId, userId);
        boolean isAdmin = "ADMIN".equals(currentUser.getRole().getRoleName());
        
        if (!isPrimaryInstructor && !isCoInstructor && !isAdmin) {
            throw new RuntimeException("You are not the instructor of this course");
        }

        return course;
    }
}
