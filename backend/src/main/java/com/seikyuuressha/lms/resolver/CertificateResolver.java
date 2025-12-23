package com.seikyuuressha.lms.resolver;

import com.seikyuuressha.lms.dto.response.CertificateResponse;
import com.seikyuuressha.lms.entity.Course;
import com.seikyuuressha.lms.entity.Users;
import com.seikyuuressha.lms.repository.CourseRepository;
import com.seikyuuressha.lms.repository.UserRepository;
import com.seikyuuressha.lms.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class CertificateResolver {

    private final CertificateService certificateService;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    @QueryMapping
    public List<CertificateResponse> getMyCertificates() {
        return certificateService.getMyCertificates();
    }

    @QueryMapping
    public CertificateResponse getCertificateByCourse(@Argument UUID courseId) {
        return certificateService.getCertificateByCourse(courseId);
    }

    @MutationMapping
    public CertificateResponse generateCertificate(@Argument UUID courseId) {
        return certificateService.generateCertificate(courseId);
    }

    @SchemaMapping(typeName = "Certificate", field = "user")
    public Users getUser(CertificateResponse certificate) {
        return userRepository.findById(certificate.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @SchemaMapping(typeName = "Certificate", field = "course")
    public Course getCourse(CertificateResponse certificate) {
        return courseRepository.findById(certificate.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }
}
