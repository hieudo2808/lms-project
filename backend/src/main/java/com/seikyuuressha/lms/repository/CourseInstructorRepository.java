package com.seikyuuressha.lms.repository;

import com.seikyuuressha.lms.entity.CourseInstructor;
import com.seikyuuressha.lms.entity.CourseInstructorId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseInstructorRepository extends JpaRepository<CourseInstructor, CourseInstructorId> {

    List<CourseInstructor> findByCourseId(UUID courseId);

    List<CourseInstructor> findByUserId(UUID userId);

    Optional<CourseInstructor> findByCourseIdAndUserId(UUID courseId, UUID userId);

    boolean existsByCourseIdAndUserId(UUID courseId, UUID userId);

    @Query("SELECT ci FROM CourseInstructor ci WHERE ci.courseId = :courseId AND ci.userRole = 'OWNER'")
    Optional<CourseInstructor> findOwnerByCourseId(@Param("courseId") UUID courseId);

    @Query("SELECT CASE WHEN COUNT(ci) > 0 THEN true ELSE false END FROM CourseInstructor ci " +
           "WHERE ci.courseId = :courseId AND ci.userId = :userId")
    boolean isInstructor(@Param("courseId") UUID courseId, @Param("userId") UUID userId);

    void deleteByCourseIdAndUserId(UUID courseId, UUID userId);
}
