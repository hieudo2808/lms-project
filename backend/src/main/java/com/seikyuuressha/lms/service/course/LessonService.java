package com.seikyuuressha.lms.service.course;

import com.seikyuuressha.lms.dto.request.CreateLessonRequest;
import com.seikyuuressha.lms.dto.request.UpdateLessonRequest;
import com.seikyuuressha.lms.dto.response.LessonResponse;
import com.seikyuuressha.lms.entity.Lesson;
import com.seikyuuressha.lms.entity.Module;
import com.seikyuuressha.lms.entity.Users;
import com.seikyuuressha.lms.mapper.LessonMapper;
import com.seikyuuressha.lms.repository.CourseInstructorRepository;
import com.seikyuuressha.lms.repository.LessonRepository;
import com.seikyuuressha.lms.repository.ModuleRepository;
import com.seikyuuressha.lms.repository.ProgressRepository;
import com.seikyuuressha.lms.repository.QuizRepository;
import com.seikyuuressha.lms.repository.VideoRepository;
import com.seikyuuressha.lms.service.common.SecurityContextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for Lesson CRUD operations.
 * Extracted from InstructorService to comply with Single Responsibility Principle.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LessonService {

    private final LessonRepository lessonRepository;
    private final ModuleRepository moduleRepository;
    private final ProgressRepository progressRepository;
    private final VideoRepository videoRepository;
    private final QuizRepository quizRepository;
    private final CourseInstructorRepository courseInstructorRepository;
    private final SecurityContextService securityContextService;
    private final LessonMapper lessonMapper;

    /**
     * Create a new lesson for a module.
     */
    @Transactional
    public LessonResponse createLesson(CreateLessonRequest request) {
        Module module = getModuleByIdAndVerifyOwnership(request.getModuleId());

        // Determine order
        int order = request.getOrder() != null ? request.getOrder() :
                module.getLessons().size() + 1;

        Lesson lesson = Lesson.builder()
                .module(module)
                .title(request.getTitle())
                .content(request.getContent())
                .durationSeconds(request.getDurationSeconds())
                .sortOrder(order)
                .build();

        lesson = lessonRepository.save(lesson);
        log.info("Lesson created. LessonId: {}, ModuleId: {}", lesson.getLessonId(), module.getModuleId());

        return lessonMapper.toLessonResponseSimple(lesson);
    }

    /**
     * Update an existing lesson.
     */
    @Transactional
    public LessonResponse updateLesson(UUID lessonId, UpdateLessonRequest request) {
        Lesson lesson = getLessonByIdAndVerifyOwnership(lessonId);

        if (request.getTitle() != null) {
            lesson.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            lesson.setContent(request.getContent());
        }
        if (request.getDurationSeconds() != null) {
            lesson.setDurationSeconds(request.getDurationSeconds());
        }
        if (request.getOrder() != null) {
            lesson.setSortOrder(request.getOrder());
        }

        lesson = lessonRepository.save(lesson);
        return lessonMapper.toLessonResponseSimple(lesson);
    }

    /**
     * Delete a lesson.
     * Handles cascade deletion of related quizzes, videos, etc.
     */
    @Transactional
    public Boolean deleteLesson(UUID lessonId) {
        Lesson lesson = getLessonByIdAndVerifyOwnership(lessonId);

        // Check if lesson has progress records
        if (progressRepository.existsByLesson_LessonId(lessonId)) {
            throw new RuntimeException("Cannot delete lesson with student progress");
        }

        // Cascade delete quiz-related data in correct order (due to FK NO ACTION constraints)
        quizRepository.deleteQuizAnswerSelectionsByLessonId(lessonId);
        quizRepository.deleteQuizAnswersByLessonId(lessonId);
        quizRepository.deleteQuizAttemptsByLessonId(lessonId);
        quizRepository.deleteAnswersByLessonId(lessonId);
        quizRepository.deleteQuestionsByLessonId(lessonId);
        quizRepository.deleteByLesson_LessonId(lessonId);
        log.info("Deleted quiz cascade for lesson. LessonId: {}", lessonId);

        // Delete associated video
        videoRepository.findByLesson_LessonId(lessonId).ifPresent(video -> {
            videoRepository.delete(video);
            log.info("Deleted video for lesson. VideoId: {}", video.getVideoId());
        });

        lessonRepository.delete(lesson);
        log.info("Lesson deleted. LessonId: {}", lessonId);
        return true;
    }

    /**
     * Reorder lessons within a module.
     */
    @Transactional
    public List<LessonResponse> reorderLessons(UUID moduleId, List<UUID> lessonIds) {
        Module module = getModuleByIdAndVerifyOwnership(moduleId);

        List<Lesson> lessons = lessonRepository.findAllById(lessonIds);
        
        // Verify all lessons belong to this module
        boolean allBelongToModule = lessons.stream()
                .allMatch(l -> l.getModule().getModuleId().equals(moduleId));
        
        if (!allBelongToModule) {
            throw new RuntimeException("Some lessons do not belong to this module");
        }

        // Update order
        for (int i = 0; i < lessonIds.size(); i++) {
            UUID lessonId = lessonIds.get(i);
            Lesson lesson = lessons.stream()
                    .filter(l -> l.getLessonId().equals(lessonId))
                    .findFirst()
                    .orElseThrow();
            lesson.setSortOrder(i + 1);
        }

        lessonRepository.saveAll(lessons);

        return lessons.stream()
                .sorted(Comparator.comparingInt(Lesson::getSortOrder))
                .map(lessonMapper::toLessonResponseSimple)
                .collect(Collectors.toList());
    }

    /**
     * Get a lesson by ID with ownership verification.
     */
    public Lesson getLessonByIdAndVerifyOwnership(UUID lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        Users currentUser = securityContextService.getCurrentInstructor();
        UUID userId = currentUser.getUserId();
        UUID courseId = lesson.getModule().getCourse().getCourseId();
        
        boolean isPrimaryInstructor = lesson.getModule().getCourse().getInstructor().getUserId().equals(userId);
        boolean isCoInstructor = courseInstructorRepository.existsByCourseIdAndUserId(courseId, userId);
        boolean isAdmin = "ADMIN".equals(currentUser.getRole().getRoleName());
        
        if (!isPrimaryInstructor && !isCoInstructor && !isAdmin) {
            throw new RuntimeException("You are not the instructor of this course");
        }

        return lesson;
    }

    /**
     * Get a module by ID with ownership verification.
     */
    private Module getModuleByIdAndVerifyOwnership(UUID moduleId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found"));

        Users currentUser = securityContextService.getCurrentInstructor();
        UUID userId = currentUser.getUserId();
        UUID courseId = module.getCourse().getCourseId();
        
        boolean isPrimaryInstructor = module.getCourse().getInstructor().getUserId().equals(userId);
        boolean isCoInstructor = courseInstructorRepository.existsByCourseIdAndUserId(courseId, userId);
        boolean isAdmin = "ADMIN".equals(currentUser.getRole().getRoleName());
        
        if (!isPrimaryInstructor && !isCoInstructor && !isAdmin) {
            throw new RuntimeException("You are not the instructor of this course");
        }

        return module;
    }
}
