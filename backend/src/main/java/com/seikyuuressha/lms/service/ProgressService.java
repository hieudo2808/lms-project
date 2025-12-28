package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.request.UpdateProgressRequest;
import com.seikyuuressha.lms.dto.response.ProgressResponse;
import com.seikyuuressha.lms.entity.Lesson;
import com.seikyuuressha.lms.entity.Progress;
import com.seikyuuressha.lms.entity.Users;
import com.seikyuuressha.lms.repository.EnrollmentRepository;
import com.seikyuuressha.lms.repository.LessonRepository;
import com.seikyuuressha.lms.repository.ProgressRepository;
import com.seikyuuressha.lms.mapper.ProgressMapper;
import com.seikyuuressha.lms.service.common.SecurityContextService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final ProgressRepository progressRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ProgressMapper progressMapper;
    private final SecurityContextService securityContextService;

    @Transactional
    public ProgressResponse updateProgress(UUID lessonId, UpdateProgressRequest request) {
        Users user = securityContextService.getCurrentUser();

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        // Check if user is enrolled in the course
        UUID courseId = lesson.getModule().getCourse().getCourseId();
        if (!enrollmentRepository.existsByUser_UserIdAndCourse_CourseId(user.getUserId(), courseId)) {
            throw new RuntimeException("Not enrolled in this course");
        }

        // Find or create progress
        Progress progress = progressRepository
                .findByUser_UserIdAndLesson_LessonId(user.getUserId(), lessonId)
                .orElse(Progress.builder()
                        .progressId(UUID.randomUUID())
                        .user(user)
                        .lesson(lesson)
                        .watchedSeconds(0)
                        .progressPercent(0.0)
                        .lastWatchedAt(OffsetDateTime.now())
                        .build());

        // Update progress - only increase, never decrease
        if (request.getWatchedSeconds() != null && request.getWatchedSeconds() > progress.getWatchedSeconds()) {
            progress.setWatchedSeconds(request.getWatchedSeconds());
        }
        if (request.getProgressPercent() != null && request.getProgressPercent() > progress.getProgressPercent()) {
            progress.setProgressPercent(request.getProgressPercent());
        }
        progress.setLastWatchedAt(OffsetDateTime.now());

        progressRepository.save(progress);
        return progressMapper.toProgressResponse(progress);
    }

    @Transactional(readOnly = true)
    public List<ProgressResponse> getMyProgress(UUID courseId) {
        UUID userId = securityContextService.getCurrentUserId();

        List<Progress> progresses = courseId != null
                ? progressRepository.findByUser_UserIdAndLesson_Module_Course_CourseId(userId, courseId)
                : progressRepository.findByUser_UserId(userId);

        return progresses.stream()
                .map(progressMapper::toProgressResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProgressResponse getLessonProgress(UUID lessonId) {
        UUID userId = securityContextService.getCurrentUserId();

        Progress progress = progressRepository
                .findByUser_UserIdAndLesson_LessonId(userId, lessonId)
                .orElse(null);

        return progress != null ? progressMapper.toProgressResponse(progress) : null;
    }
}
