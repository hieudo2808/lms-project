package com.seikyuuressha.lms.resolver;

import com.seikyuuressha.lms.dto.request.*;
import com.seikyuuressha.lms.dto.response.*;
import com.seikyuuressha.lms.service.InstructorService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class InstructorResolver {

    private final InstructorService instructorService;

    // ==================== COURSE MANAGEMENT ====================

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public CourseResponse createCourse(@Argument CreateCourseRequest input) {
        return instructorService.createCourse(input);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public CourseResponse updateCourse(@Argument UUID courseId, @Argument UpdateCourseRequest input) {
        return instructorService.updateCourse(courseId, input);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public Boolean deleteCourse(@Argument UUID courseId) {
        return instructorService.deleteCourse(courseId);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public CourseResponse publishCourse(@Argument UUID courseId) {
        return instructorService.publishCourse(courseId);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public CourseResponse unpublishCourse(@Argument UUID courseId) {
        return instructorService.unpublishCourse(courseId);
    }

    @QueryMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public List<CourseResponse> getMyCourses() {
        return instructorService.getMyCourses();
    }

    // ==================== CO-INSTRUCTOR MANAGEMENT ====================

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public CoInstructorResponse addCoInstructor(@Argument UUID courseId, @Argument String email) {
        return instructorService.addCoInstructor(courseId, email);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public Boolean removeCoInstructor(@Argument UUID courseId, @Argument UUID userId) {
        return instructorService.removeCoInstructor(courseId, userId);
    }

    // ==================== MODULE MANAGEMENT ====================

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ModuleResponse createModule(@Argument CreateModuleRequest input) {
        return instructorService.createModule(input);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ModuleResponse updateModule(@Argument UUID moduleId, @Argument UpdateModuleRequest input) {
        return instructorService.updateModule(moduleId, input);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public Boolean deleteModule(@Argument UUID moduleId) {
        return instructorService.deleteModule(moduleId);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public List<ModuleResponse> reorderModules(@Argument UUID courseId, @Argument List<UUID> moduleIds) {
        return instructorService.reorderModules(courseId, moduleIds);
    }

    // ==================== LESSON MANAGEMENT ====================

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public LessonResponse createLesson(@Argument CreateLessonRequest input) {
        return instructorService.createLesson(input);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public LessonResponse updateLesson(@Argument UUID lessonId, @Argument UpdateLessonRequest input) {
        return instructorService.updateLesson(lessonId, input);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public Boolean deleteLesson(@Argument UUID lessonId) {
        return instructorService.deleteLesson(lessonId);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public List<LessonResponse> reorderLessons(@Argument UUID moduleId, @Argument List<UUID> lessonIds) {
        return instructorService.reorderLessons(moduleId, lessonIds);
    }

    // ==================== DASHBOARD QUERIES ====================

    @QueryMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public List<EnrollmentResponse> getCourseEnrollments(@Argument UUID courseId) {
        return instructorService.getCourseEnrollments(courseId);
    }

    @QueryMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public Map<String, Object> getCourseRevenue(@Argument UUID courseId) {
        return instructorService.getCourseRevenue(courseId);
    }

    @QueryMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public List<Map<String, Object>> getStudentProgress(@Argument UUID courseId) {
        return instructorService.getStudentProgress(courseId);
    }

    @QueryMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public long getTotalStudentsCount() {
        return instructorService.getTotalStudentsCount();
    }
}
