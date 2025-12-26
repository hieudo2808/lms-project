package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.entity.Lesson;
import com.seikyuuressha.lms.entity.LessonResource;
import com.seikyuuressha.lms.entity.Users;
import com.seikyuuressha.lms.repository.LessonRepository;
import com.seikyuuressha.lms.repository.LessonResourceRepository;
import com.seikyuuressha.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LessonResourceService {

    private final LessonResourceRepository lessonResourceRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Transactional
    public Map<String, String> generateUploadUrl(UUID lessonId, String fileName, String contentType) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        Users currentUser = getCurrentUser();
        if (!lesson.getModule().getCourse().getInstructor().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Only the instructor can upload resources for this lesson");
        }

        String s3Key = "resources/" + lessonId + "/" + UUID.randomUUID() + "_" + fileName;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .contentType(contentType)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .putObjectRequest(putObjectRequest)
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
        
        return Map.of(
                "uploadUrl", presignedRequest.url().toString(),
                "s3Key", s3Key
        );
    }

    @Transactional
    public LessonResource confirmUpload(UUID lessonId, String s3Key, String fileName, String resourceType, Long fileSize) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        Users currentUser = getCurrentUser();
        if (!lesson.getModule().getCourse().getInstructor().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Only the instructor can add resources for this lesson");
        }

        LessonResource resource = LessonResource.builder()
                .lesson(lesson)
                .fileName(fileName)
                .s3Key(s3Key)
                .resourceType(resourceType)
                .fileSize(fileSize)
                .build();

        resource = lessonResourceRepository.save(resource);
        log.info("Resource saved: {} for lesson {}", fileName, lessonId);
        return resource;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getResourcesByLesson(UUID lessonId) {
        List<LessonResource> resources = lessonResourceRepository.findByLesson_LessonIdOrderByCreatedAtDesc(lessonId);
        
        return resources.stream()
                .map(r -> Map.<String, Object>of(
                        "resourceId", r.getResourceId(),
                        "lessonId", r.getLesson().getLessonId(),
                        "fileName", r.getFileName() != null ? r.getFileName() : "",
                        "resourceType", r.getResourceType() != null ? r.getResourceType() : "",
                        "fileSize", r.getFileSize() != null ? r.getFileSize() : 0L,
                        "downloadUrl", generateDownloadUrl(r.getS3Key()),
                        "createdAt", r.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public boolean deleteResource(UUID resourceId) {
        LessonResource resource = lessonResourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        Users currentUser = getCurrentUser();
        if (!resource.getLesson().getModule().getCourse().getInstructor().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Only the instructor can delete this resource");
        }

        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(resource.getS3Key())
                    .build());
        } catch (Exception e) {
            log.warn("Failed to delete S3 object: {}", e.getMessage());
        }

        lessonResourceRepository.delete(resource);
        log.info("Resource deleted: {}", resourceId);
        return true;
    }

    private String generateDownloadUrl(String s3Key) {
        if (s3Key == null) return null;
        
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofHours(1))
                .getObjectRequest(GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(s3Key)
                        .build())
                .build();

        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }

    private Users getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userIdStr = authentication.getName();
        
        try {
            UUID userId = UUID.fromString(userIdStr);
            return userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        } catch (IllegalArgumentException e) {
            return userRepository.findByEmail(userIdStr)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }
    }
}
