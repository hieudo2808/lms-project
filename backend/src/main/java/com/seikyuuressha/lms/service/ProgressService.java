package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.request.UpdateProgressRequest;
import com.seikyuuressha.lms.dto.response.ProgressResponse;
import com.seikyuuressha.lms.entity.Lesson;
import com.seikyuuressha.lms.entity.Progress;
import com.seikyuuressha.lms.entity.Users;
import com.seikyuuressha.lms.repository.EnrollmentRepository;
import com.seikyuuressha.lms.repository.LessonRepository;
import com.seikyuuressha.lms.repository.ProgressRepository;
import com.seikyuuressha.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
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
    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Transactional
    public ProgressResponse updateProgress(UUID lessonId, UpdateProgressRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

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

        // Update progress
        if (request.getWatchedSeconds() != null) {
            progress.setWatchedSeconds(request.getWatchedSeconds());
        }
        if (request.getProgressPercent() != null) {
            progress.setProgressPercent(request.getProgressPercent());
        }
        progress.setLastWatchedAt(OffsetDateTime.now());

        progressRepository.save(progress);

        return mapToProgressResponse(progress);
    }

    @Transactional(readOnly = true)
    public List<ProgressResponse> getMyProgress(UUID courseId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Progress> progresses = courseId != null
                ? progressRepository.findByUser_UserIdAndLesson_Module_Course_CourseId(user.getUserId(), courseId)
                : progressRepository.findByUser_UserId(user.getUserId());

        return progresses.stream()
                .map(this::mapToProgressResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProgressResponse getLessonProgress(UUID lessonId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Progress progress = progressRepository
                .findByUser_UserIdAndLesson_LessonId(user.getUserId(), lessonId)
                .orElse(null);

        return progress != null ? mapToProgressResponse(progress) : null;
    }

    private ProgressResponse mapToProgressResponse(Progress progress) {
        return ProgressResponse.builder()
                .lessonId(progress.getLesson().getLessonId())
                .lessonTitle(progress.getLesson().getTitle())
                .watchedSeconds(progress.getWatchedSeconds())
                .progressPercent(progress.getProgressPercent())
                .lastWatchedAt(progress.getLastWatchedAt())
                .build();
    }
}
