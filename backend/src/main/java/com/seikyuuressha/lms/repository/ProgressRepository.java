package com.seikyuuressha.lms.repository;

import com.seikyuuressha.lms.entity.Progress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProgressRepository extends JpaRepository<Progress, UUID> {
    Optional<Progress> findByUser_UserIdAndLesson_LessonId(UUID userId, UUID lessonId);
    List<Progress> findByUser_UserId(UUID userId);
    List<Progress> findByUser_UserIdAndLesson_Module_Course_CourseId(UUID userId, UUID courseId);
    boolean existsByLesson_LessonId(UUID lessonId);
    
    void deleteByUser_UserIdAndLesson_Module_Course_CourseId(UUID userId, UUID courseId);
    
    default List<Progress> findProgressByCourseAndUser(UUID courseId, UUID userId) {
        return findByUser_UserIdAndLesson_Module_Course_CourseId(userId, courseId);
    }
}

