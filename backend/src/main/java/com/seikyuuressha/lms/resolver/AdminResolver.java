package com.seikyuuressha.lms.resolver;

import com.seikyuuressha.lms.dto.request.CreateCategoryRequest;
import com.seikyuuressha.lms.dto.request.UpdateCategoryRequest;
import com.seikyuuressha.lms.dto.response.*;
import com.seikyuuressha.lms.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class AdminResolver {

    private final AdminService adminService;

    // ==================== USER MANAGEMENT ====================

    @QueryMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getAllUsers(
            @Argument Integer page,
            @Argument Integer limit,
            @Argument String roleName) {
        return adminService.getAllUsers(page, limit, roleName);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse updateUserRole(@Argument UUID userId, @Argument UUID roleId) {
        return adminService.updateUserRole(userId, roleId);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Boolean lockUser(@Argument UUID userId, @Argument String reason) {
        return adminService.lockUser(userId, reason);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Boolean unlockUser(@Argument UUID userId) {
        return adminService.unlockUser(userId);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Boolean deleteUser(@Argument UUID userId) {
        return adminService.deleteUser(userId);
    }

    // ==================== COURSE MODERATION ====================

    @QueryMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<CourseResponse> getAllCoursesAdmin(
            @Argument Boolean isPublished,
            @Argument Integer page,
            @Argument Integer limit) {
        return adminService.getAllCoursesAdmin(isPublished, page, limit);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public CourseResponse approveCourse(@Argument UUID courseId) {
        return adminService.approveCourse(courseId);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public CourseResponse rejectCourse(@Argument UUID courseId, @Argument String reason) {
        return adminService.rejectCourse(courseId, reason);
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Boolean deleteCourseAdmin(@Argument UUID courseId) {
        return adminService.deleteCourseAdmin(courseId);
    }

    // ==================== SYSTEM REPORTS ====================

    @QueryMapping
    @PreAuthorize("hasRole('ADMIN')")
    public SystemStatisticsResponse getSystemStatistics() {
        return adminService.getSystemStatistics();
    }

    @QueryMapping
    @PreAuthorize("hasRole('ADMIN')")
    public RevenueReportResponse getRevenueReport(
            @Argument @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @Argument @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate) {
        return adminService.getRevenueReport(startDate, endDate);
    }

    @QueryMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<PaymentResponse> getAllPayments(
            @Argument Integer page,
            @Argument Integer limit,
            @Argument String status) {
        return adminService.getAllPayments(page, limit, status);
    }

    // ==================== CATEGORY MANAGEMENT ====================

    @QueryMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<CategoryResponse> getAllCategories() {
        return adminService.getAllCategories();
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public CategoryResponse createCategory(@Argument("input") CreateCategoryRequest input) {
        return adminService.createCategory(input.getName(), input.getSlug(), input.getDescription());
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public CategoryResponse updateCategory(
            @Argument UUID categoryId,
            @Argument("input") UpdateCategoryRequest input) {
        return adminService.updateCategory(categoryId, input.getName(), input.getSlug(), input.getDescription());
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Boolean deleteCategory(@Argument UUID categoryId) {
        return adminService.deleteCategory(categoryId);
    }
}
