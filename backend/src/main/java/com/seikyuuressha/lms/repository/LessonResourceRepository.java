package com.seikyuuressha.lms.repository;

import com.seikyuuressha.lms.entity.LessonResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LessonResourceRepository extends JpaRepository<LessonResource, UUID> {
    List<LessonResource> findByLesson_LessonIdOrderByCreatedAtDesc(UUID lessonId);
    void deleteByResourceId(UUID resourceId);
}
