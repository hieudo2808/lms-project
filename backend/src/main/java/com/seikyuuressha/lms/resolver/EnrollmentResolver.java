package com.seikyuuressha.lms.resolver;

import com.seikyuuressha.lms.dto.response.EnrollmentResponse;
import com.seikyuuressha.lms.service.EnrollmentService;
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
public class EnrollmentResolver {

    private final EnrollmentService enrollmentService;

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public EnrollmentResponse enrollCourse(@Argument UUID courseId) {
        return enrollmentService.enrollCourse(courseId);
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<EnrollmentResponse> myEnrollments() {
        return enrollmentService.getMyEnrollments();
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public Boolean isEnrolled(@Argument UUID courseId) {
        return enrollmentService.isEnrolled(courseId);
    }
}
