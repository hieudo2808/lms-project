package com.seikyuuressha.lms.repository;

import com.seikyuuressha.lms.entity.Quiz;
import com.seikyuuressha.lms.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    List<Quiz> findByCourseAndIsPublishedOrderByOrderIndexAsc(Course course, Boolean isPublished);
    List<Quiz> findByCourseOrderByOrderIndexAsc(Course course);
    List<Quiz> findByLesson_LessonIdAndIsPublishedOrderByOrderIndex(UUID lessonId, Boolean isPublished);

    List<Quiz> findByLesson_LessonIdOrderByOrderIndex(UUID lessonId);
}
