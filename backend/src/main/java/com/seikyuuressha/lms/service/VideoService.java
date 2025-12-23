package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.request.VideoUploadRequest;
import com.seikyuuressha.lms.dto.response.PresignedUrlResponse;
import com.seikyuuressha.lms.dto.response.VideoResponse;
import com.seikyuuressha.lms.entity.Lesson;
import com.seikyuuressha.lms.entity.Users;
import com.seikyuuressha.lms.entity.Video;
import com.seikyuuressha.lms.repository.LessonRepository;
import com.seikyuuressha.lms.repository.UserRepository;
import com.seikyuuressha.lms.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VideoService {

    private final VideoRepository videoRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.cloudfront-domain:}")
    private String cloudfrontDomain;

    @Value("${aws.s3.presigned-url-expiration:3600}")
    private Long presignedUrlExpiration;

    /**
     * Generate pre-signed URL for video upload
     */
    @Transactional
    public PresignedUrlResponse generateUploadUrl(VideoUploadRequest request) {
        Users currentUser = getCurrentUser();
        
        // Verify lesson exists and user is instructor
        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        if (!lesson.getModule().getCourse().getInstructor().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Only the instructor can upload videos for this lesson");
        }

        // If a previous video exists (even failed), remove it so a fresh upload can proceed
        videoRepository.findByLesson_LessonId(request.getLessonId())
                .ifPresent(existingVideo -> {
                    try {
                        if (existingVideo.getS3Key() != null) {
                            s3Client.deleteObject(DeleteObjectRequest.builder()
                                    .bucket(bucketName)
                                    .key(existingVideo.getS3Key())
                                    .build());
                        }
                    } catch (Exception e) {
                        log.warn("Could not delete old S3 object: {}", e.getMessage());
                    }

                    videoRepository.delete(existingVideo);
                    videoRepository.flush();
                });

        // Generate unique S3 key
        String s3Key = generateS3Key(currentUser.getUserId(), lesson.getLessonId(), request.getFilename());

        // Create video record with PENDING status
        Video video = Video.builder()
                .lesson(lesson)
                .s3Key(s3Key)
                .s3Bucket(bucketName)
                .originalFilename(request.getFilename())
                .fileSize(request.getFileSize())
                .mimeType(request.getContentType())
                .processingStatus(Video.ProcessingStatus.PENDING)
                .build();

        video = videoRepository.save(video);

        // Generate pre-signed URL
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .contentType(request.getContentType())
                .metadata(java.util.Map.of(
                        "videoId", video.getVideoId().toString(),
                        "lessonId", lesson.getLessonId().toString(),
                        "instructorId", currentUser.getUserId().toString()
                ))
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofSeconds(presignedUrlExpiration))
                .putObjectRequest(putObjectRequest)
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);

        return PresignedUrlResponse.builder()
                .videoId(video.getVideoId())
                .uploadUrl(presignedRequest.url().toString())
                .s3Key(s3Key)
                .expiresIn(presignedUrlExpiration)
                .build();
    }

    /**
     * Confirm video upload and update status
     */
    @Transactional
    public VideoResponse confirmUpload(UUID videoId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Video not found"));

        Users currentUser = getCurrentUser();
        if (!video.getLesson().getModule().getCourse().getInstructor().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Unauthorized");
        }

        // Verify file exists in S3
        try {
            HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(video.getS3Key())
                    .build();

            HeadObjectResponse response = s3Client.headObject(headObjectRequest);
            
            // Update file size if not set
            if (video.getFileSize() == null) {
                video.setFileSize(response.contentLength());
            }

            // Update status to PROCESSING (will be handled by background job)
            video.setProcessingStatus(Video.ProcessingStatus.PROCESSING);
            video = videoRepository.save(video);

            // TODO: Send to transcoding queue (e.g., AWS MediaConvert, or custom queue)
            log.info("Video uploaded successfully. VideoId: {}, S3Key: {}", video.getVideoId(), video.getS3Key());

        } catch (S3Exception e) {
            video.setProcessingStatus(Video.ProcessingStatus.FAILED);
            video.setErrorMessage("File not found in S3: " + e.getMessage());
            videoRepository.save(video);
            throw new RuntimeException("Video file not found in S3");
        }

        return mapToVideoResponse(video);
    }

    /**
     * Get video stream URL
     */
    @Transactional(readOnly = true)
    public String getVideoStreamUrl(UUID lessonId) {
        Video video = videoRepository.findByLesson_LessonId(lessonId)
                .orElseThrow(() -> new RuntimeException("Video not found for this lesson"));

        if (video.getProcessingStatus() != Video.ProcessingStatus.COMPLETED) {
            throw new RuntimeException("Video is not ready for streaming. Status: " + video.getProcessingStatus());
        }

        // If CloudFront is configured, use it
        if (cloudfrontDomain != null && !cloudfrontDomain.isEmpty()) {
            String key = video.getHlsManifestKey() != null ? video.getHlsManifestKey() : video.getS3Key();
            return String.format("https://%s/%s", cloudfrontDomain, key);
        }

        // Otherwise, generate S3 URL
        return String.format("https://%s.s3.amazonaws.com/%s", bucketName, video.getS3Key());
    }

    /**
     * Get video details
     */
    @Transactional(readOnly = true)
    public VideoResponse getVideoByLesson(UUID lessonId) {
        Video video = videoRepository.findByLesson_LessonId(lessonId)
                .orElseThrow(() -> new RuntimeException("Video not found for this lesson"));

        return mapToVideoResponse(video);
    }

    /**
     * Get all videos for instructor's courses
     */
    @Transactional(readOnly = true)
    public List<VideoResponse> getMyVideos() {
        Users currentUser = getCurrentUser();
        List<Video> videos = videoRepository.findByInstructorId(currentUser.getUserId());
        
        return videos.stream()
                .map(this::mapToVideoResponse)
                .collect(Collectors.toList());
    }

    /**
     * Delete video
     */
    @Transactional
    public Boolean deleteVideo(UUID videoId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Video not found"));

        Users currentUser = getCurrentUser();
        if (!video.getLesson().getModule().getCourse().getInstructor().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Only the instructor can delete this video");
        }

        // Delete from S3
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(video.getS3Key())
                    .build();

            s3Client.deleteObject(deleteObjectRequest);

            // Delete thumbnail if exists
            if (video.getThumbnailS3Key() != null) {
                DeleteObjectRequest deleteThumbnailRequest = DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(video.getThumbnailS3Key())
                        .build();
                s3Client.deleteObject(deleteThumbnailRequest);
            }

            // Delete HLS manifest if exists
            if (video.getHlsManifestKey() != null) {
                // TODO: Delete all HLS segments
            }

            log.info("Video deleted from S3. VideoId: {}", videoId);
        } catch (S3Exception e) {
            log.error("Failed to delete video from S3: {}", e.getMessage());
            // Continue to delete from database anyway
        }

        // Delete from database
        videoRepository.delete(video);
        return true;
    }

    /**
     * Update video processing status (called by background job)
     */
    @Transactional
    public VideoResponse updateProcessingStatus(UUID videoId, 
                                                Video.ProcessingStatus status,
                                                Integer durationSeconds,
                                                String resolution,
                                                String hlsManifestKey,
                                                String thumbnailKey,
                                                String errorMessage) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Video not found"));

        video.setProcessingStatus(status);
        video.setDurationSeconds(durationSeconds);
        video.setResolution(resolution);
        video.setHlsManifestKey(hlsManifestKey);
        video.setThumbnailS3Key(thumbnailKey);
        video.setErrorMessage(errorMessage);

        if (status == Video.ProcessingStatus.COMPLETED || status == Video.ProcessingStatus.FAILED) {
            video.setProcessedAt(OffsetDateTime.now());
        }

        video = videoRepository.save(video);

        // Update lesson video URL if completed
        if (status == Video.ProcessingStatus.COMPLETED) {
            Lesson lesson = video.getLesson();
            lesson.setVideoUrl(getVideoStreamUrl(lesson.getLessonId()));
            lesson.setDurationSeconds(durationSeconds);
            lessonRepository.save(lesson);
        }

        return mapToVideoResponse(video);
    }

    // Helper methods

    private String generateS3Key(UUID instructorId, UUID lessonId, String filename) {
        String extension = filename.substring(filename.lastIndexOf('.'));
        String timestamp = System.currentTimeMillis() + "";
        return String.format("videos/%s/%s/%s%s", instructorId, lessonId, timestamp, extension);
    }

    private VideoResponse mapToVideoResponse(Video video) {
        String streamUrl = null;
        String thumbnailUrl = null;

        if (video.getProcessingStatus() == Video.ProcessingStatus.COMPLETED) {
            try {
                streamUrl = getVideoStreamUrl(video.getLesson().getLessonId());
            } catch (Exception e) {
                log.warn("Failed to generate stream URL: {}", e.getMessage());
            }

            if (video.getThumbnailS3Key() != null) {
                if (cloudfrontDomain != null && !cloudfrontDomain.isEmpty()) {
                    thumbnailUrl = String.format("https://%s/%s", cloudfrontDomain, video.getThumbnailS3Key());
                } else {
                    thumbnailUrl = String.format("https://%s.s3.amazonaws.com/%s", bucketName, video.getThumbnailS3Key());
                }
            }
        }

        return VideoResponse.builder()
                .videoId(video.getVideoId())
                .lessonId(video.getLesson().getLessonId())
                .originalFilename(video.getOriginalFilename())
                .fileSize(video.getFileSize())
                .mimeType(video.getMimeType())
                .durationSeconds(video.getDurationSeconds())
                .resolution(video.getResolution())
                .processingStatus(video.getProcessingStatus().name())
                .streamUrl(streamUrl)
                .thumbnailUrl(thumbnailUrl)
                .uploadedAt(video.getUploadedAt())
                .processedAt(video.getProcessedAt())
                .errorMessage(video.getErrorMessage())
                .build();
    }

    private Users getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Unauthorized");
        }

        String principal = authentication.getName();

        try {
            UUID userId = UUID.fromString(principal);
            return userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        } catch (IllegalArgumentException ex) {
            // Fallback for tokens that still use email as principal
            return userRepository.findByEmail(principal)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }
    }
}
