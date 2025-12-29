package com.seikyuuressha.lms.resolver;

import com.seikyuuressha.lms.dto.response.CourseResponse;
import com.seikyuuressha.lms.service.AdminService;
import com.seikyuuressha.lms.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class CourseResolver {

    private final CourseService courseService;
    private final AdminService adminService;

    @QueryMapping
    public List<CourseResponse> getAllCourses(@Argument UUID categoryId) {
        return courseService.getAllPublishedCourses(categoryId);
    }

    @QueryMapping
    public CourseResponse getCourseById(@Argument UUID courseId) {
        return courseService.getCourseById(courseId);
    }

    @QueryMapping
    public CourseResponse getCourseBySlug(@Argument String slug) {
        return courseService.getCourseBySlug(slug);
    }

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
}
