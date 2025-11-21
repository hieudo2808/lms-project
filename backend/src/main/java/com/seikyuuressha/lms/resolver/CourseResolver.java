package com.seikyuuressha.lms.resolver;

import com.seikyuuressha.lms.dto.response.CourseResponse;
import com.seikyuuressha.lms.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class CourseResolver {

    private final CourseService courseService;

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
}
