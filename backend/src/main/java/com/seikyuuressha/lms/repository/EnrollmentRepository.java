package com.seikyuuressha.lms.repository;

import com.seikyuuressha.lms.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    Optional<Enrollment> findByUser_UserIdAndCourse_CourseId(UUID userId, UUID courseId);

    List<Enrollment> findByUser_UserId(UUID userId);

    List<Enrollment> findByCourse_CourseId(UUID courseId);

    boolean existsByUser_UserIdAndCourse_CourseId(UUID userId, UUID courseId);

    boolean existsByCourse_CourseId(UUID courseId);

    boolean existsByUser_UserId(UUID userId);

    long countByCourse_CourseId(UUID courseId);

    default boolean existsByUserAndCourse(com.seikyuuressha.lms.entity.Users user,
            com.seikyuuressha.lms.entity.Course course) {
        return existsByUser_UserIdAndCourse_CourseId(user.getUserId(), course.getCourseId());
    }

    default Optional<Enrollment> findByUserAndCourse(com.seikyuuressha.lms.entity.Users user,
            com.seikyuuressha.lms.entity.Course course) {
        return findByUser_UserIdAndCourse_CourseId(user.getUserId(), course.getCourseId());
    }
}