package com.seikyuuressha.lms.resolver;

import com.seikyuuressha.lms.dto.request.*;
import com.seikyuuressha.lms.dto.response.*;
import com.seikyuuressha.lms.service.InstructorService;
import com.seikyuuressha.lms.service.analytics.RevenueService;
import com.seikyuuressha.lms.service.course.LessonService;
import com.seikyuuressha.lms.service.course.ModuleService;
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
    private final ModuleService moduleService;
    private final LessonService lessonService;
    private final RevenueService revenueService;

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

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ModuleResponse createModule(@Argument CreateModuleRequest input) {
        return moduleService.createModule(input);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ModuleResponse updateModule(@Argument UUID moduleId, @Argument UpdateModuleRequest input) {
        return moduleService.updateModule(moduleId, input);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public Boolean deleteModule(@Argument UUID moduleId) {
        return moduleService.deleteModule(moduleId);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public List<ModuleResponse> reorderModules(@Argument UUID courseId, @Argument List<UUID> moduleIds) {
        return moduleService.reorderModules(courseId, moduleIds);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public LessonResponse createLesson(@Argument CreateLessonRequest input) {
        return lessonService.createLesson(input);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public LessonResponse updateLesson(@Argument UUID lessonId, @Argument UpdateLessonRequest input) {
        return lessonService.updateLesson(lessonId, input);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public Boolean deleteLesson(@Argument UUID lessonId) {
        return lessonService.deleteLesson(lessonId);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public List<LessonResponse> reorderLessons(@Argument UUID moduleId, @Argument List<UUID> lessonIds) {
        return lessonService.reorderLessons(moduleId, lessonIds);
    }

    @QueryMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public List<EnrollmentResponse> getCourseEnrollments(@Argument UUID courseId) {
        return instructorService.getCourseEnrollments(courseId);
    }

    @QueryMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public Map<String, Object> getCourseRevenue(@Argument UUID courseId) {
        return revenueService.getCourseRevenue(courseId);
    }

    @QueryMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public List<Map<String, Object>> getStudentProgress(@Argument UUID courseId) {
        return revenueService.getStudentProgress(courseId);
    }

    @QueryMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public long getTotalStudentsCount() {
        return revenueService.getTotalStudentsCount();
    }

    @QueryMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public List<Map<String, Object>> getMonthlyRevenue(@Argument int months) {
        return revenueService.getMonthlyRevenue(months);
    }

    @QueryMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public List<Map<String, Object>> getCourseMonthlyRevenue(@Argument UUID courseId, @Argument int months) {
        return revenueService.getCourseMonthlyRevenue(courseId, months);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public boolean removeStudentFromCourse(@Argument UUID courseId, @Argument UUID userId) {
        return instructorService.removeStudentFromCourse(courseId, userId);
    }
}
