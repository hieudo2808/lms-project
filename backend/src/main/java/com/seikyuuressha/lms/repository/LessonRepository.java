package com.seikyuuressha.lms.repository;

import com.seikyuuressha.lms.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, UUID> {
    
    // Get all lessons in a course (through modules)
    @Query("SELECT l FROM Lesson l WHERE l.module.course.courseId = :courseId")
    List<Lesson> findByCourseId(UUID courseId);
    
    // Count total lessons in a course
    @Query("SELECT COUNT(l) FROM Lesson l WHERE l.module.course.courseId = :courseId")
    long countByCourseId(UUID courseId);
}