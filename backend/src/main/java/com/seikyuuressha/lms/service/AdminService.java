package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.response.*;
import com.seikyuuressha.lms.entity.Categories;
import com.seikyuuressha.lms.mapper.CategoryMapper;
import com.seikyuuressha.lms.repository.CategoryRepository;
import com.seikyuuressha.lms.service.admin.CourseApprovalService;
import com.seikyuuressha.lms.service.admin.StatisticsService;
import com.seikyuuressha.lms.service.admin.UserManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserManagementService userManagementService;
    private final CourseApprovalService courseApprovalService;
    private final StatisticsService statisticsService;
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    public List<UserResponse> getAllUsers(Integer page, Integer limit, String roleName) {
        return userManagementService.getAllUsers(page, limit, roleName);
    }

    public UserResponse updateUserRole(UUID userId, UUID roleId) {
        return userManagementService.updateUserRole(userId, roleId);
    }

    public Boolean lockUser(UUID userId, String reason) {
        return userManagementService.lockUser(userId, reason);
    }

    public Boolean unlockUser(UUID userId) {
        return userManagementService.unlockUser(userId);
    }

    public Boolean deleteUser(UUID userId) {
        return userManagementService.deleteUser(userId);
    }

    public UserResponse createUser(String fullName, String email, String password, UUID roleId) {
        return userManagementService.createUser(fullName, email, password, roleId);
    }

    public UserResponse updateUser(UUID userId, String fullName, String email, String password, UUID roleId) {
        return userManagementService.updateUser(userId, fullName, email, password, roleId);
    }

    public List<CourseResponse> getAllCoursesAdmin(Boolean isPublished, Integer page, Integer limit) {
        return courseApprovalService.getAllCoursesAdmin(isPublished, page, limit);
    }

    public CourseResponse approveCourse(UUID courseId) {
        return courseApprovalService.approveCourse(courseId);
    }

    public CourseResponse rejectCourse(UUID courseId, String reason) {
        return courseApprovalService.rejectCourse(courseId, reason);
    }

    public Boolean deleteCourseAdmin(UUID courseId) {
        return courseApprovalService.deleteCourseAdmin(courseId);
    }

    public SystemStatisticsResponse getSystemStatistics() {
        return statisticsService.getSystemStatistics();
    }

    public RevenueReportResponse getRevenueReport(OffsetDateTime startDate, OffsetDateTime endDate) {
        return statisticsService.getRevenueReport(startDate, endDate);
    }

    public List<PaymentResponse> getAllPayments(Integer page, Integer limit, String status) {
        return statisticsService.getAllPayments(page, limit, status);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toCategoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse createCategory(String name, String slug, String description) {
        if (categoryRepository.findBySlug(slug).isPresent()) {
            throw new RuntimeException("Slug đã tồn tại: " + slug);
        }

        Categories category = Categories.builder()
                .name(name)
                .slug(slug)
                .description(description)
                .build();

        category = categoryRepository.save(category);
        log.info("Category created. CategoryId: {}, Name: {}", category.getCategoryId(), name);
        return categoryMapper.toCategoryResponse(category);
    }

    @Transactional
    public CategoryResponse updateCategory(UUID categoryId, String name, String slug, String description) {
        Categories category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));

        if (slug != null && !slug.equals(category.getSlug())) {
            if (categoryRepository.findBySlug(slug).isPresent()) {
                throw new RuntimeException("Slug đã tồn tại: " + slug);
            }
            category.setSlug(slug);
        }

        if (name != null) {
            category.setName(name);
        }
        if (description != null) {
            category.setDescription(description);
        }

        category = categoryRepository.save(category);
        log.info("Category updated. CategoryId: {}", categoryId);
        return categoryMapper.toCategoryResponse(category);
    }

    @Transactional
    public Boolean deleteCategory(UUID categoryId) {
        Categories category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));

        if (category.getCourses() != null && !category.getCourses().isEmpty()) {
            throw new RuntimeException("Không thể xóa danh mục đang có khóa học");
        }

        categoryRepository.delete(category);
        log.info("Category deleted. CategoryId: {}", categoryId);
        return true;
    }
}
