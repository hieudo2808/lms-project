package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.request.VideoUploadRequest;
import com.seikyuuressha.lms.dto.response.PresignedUrlResponse;
import com.seikyuuressha.lms.dto.response.VideoResponse;
import com.seikyuuressha.lms.entity.Lesson;
import com.seikyuuressha.lms.entity.Users;
import com.seikyuuressha.lms.entity.Video;
import com.seikyuuressha.lms.mapper.VideoMapper;
import com.seikyuuressha.lms.repository.CourseInstructorRepository;
import com.seikyuuressha.lms.repository.LessonRepository;
import com.seikyuuressha.lms.repository.VideoRepository;
import com.seikyuuressha.lms.service.common.SecurityContextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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
    private final CourseInstructorRepository courseInstructorRepository;
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final SecurityContextService securityContextService;
    private final VideoMapper videoMapper;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.presigned-url-expiration:3600}")
    private Long presignedUrlExpiration;

    /**
     * Generate pre-signed URL for video upload
     */
    @Transactional
    public PresignedUrlResponse generateUploadUrl(VideoUploadRequest request) {
        Users currentUser = securityContextService.getCurrentUser();
        
        // Verify lesson exists and user is instructor or co-instructor
        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        UUID courseId = lesson.getModule().getCourse().getCourseId();
        UUID userId = currentUser.getUserId();
        boolean isPrimaryInstructor = lesson.getModule().getCourse().getInstructor().getUserId().equals(userId);
        boolean isCoInstructor = courseInstructorRepository.existsByCourseIdAndUserId(courseId, userId);
        
        if (!isPrimaryInstructor && !isCoInstructor) {
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

        // Generate pre-signed URL (minimal - no headers signed to avoid mismatch)
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                // Don't set contentType here - let frontend decide
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
    public VideoResponse confirmUpload(UUID videoId, Integer durationSeconds) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Video not found"));

        Users currentUser = securityContextService.getCurrentUser();
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

            // Set duration on Video entity
            if (durationSeconds != null && durationSeconds > 0) {
                video.setDurationSeconds(durationSeconds);
                
                // Also update the Lesson's durationSeconds
                Lesson lesson = video.getLesson();
                lesson.setDurationSeconds(durationSeconds);
                lessonRepository.save(lesson);
                
                log.info("Set video duration: {} seconds for VideoId: {}", durationSeconds, video.getVideoId());
            }

            // Direct streaming: set COMPLETED immediately (no transcoding needed)
            video.setProcessingStatus(Video.ProcessingStatus.COMPLETED);
            video = videoRepository.save(video);

            log.info("Video uploaded and ready for streaming. VideoId: {}, S3Key: {}", video.getVideoId(), video.getS3Key());

        } catch (S3Exception e) {
            video.setProcessingStatus(Video.ProcessingStatus.FAILED);
            videoRepository.save(video);
            throw new RuntimeException("Video file not found in S3: " + e.getMessage());
        }

        return mapToVideoResponse(video);
    }

    /**
     * Get video stream URL (using S3 Presigned URL)
     */
    @Transactional(readOnly = true)
    public String getVideoStreamUrl(UUID lessonId) {
        Video video = videoRepository.findByLesson_LessonId(lessonId)
                .orElseThrow(() -> new RuntimeException("Video not found for this lesson"));

        if (video.getProcessingStatus() != Video.ProcessingStatus.COMPLETED) {
            throw new RuntimeException("Video is not ready for streaming. Status: " + video.getProcessingStatus());
        }

        // Generate S3 Presigned GET URL
        return generatePresignedGetUrl(video.getS3Key());
    }

    /**
     * Generate a presigned GET URL for S3 object
     */
    private String generatePresignedGetUrl(String s3Key) {
        // Add Cache-Control header for browser caching (24 hours)
        software.amazon.awssdk.services.s3.model.GetObjectRequest getObjectRequest = 
            software.amazon.awssdk.services.s3.model.GetObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .responseCacheControl("public, max-age=86400") // Cache for 24 hours
                .build();

        software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest presignRequest = 
            software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofSeconds(presignedUrlExpiration))
                .getObjectRequest(getObjectRequest)
                .build();

        software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest presignedRequest = 
            s3Presigner.presignGetObject(presignRequest);

        return presignedRequest.url().toString();
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
        Users currentUser = securityContextService.getCurrentUser();
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

        Users currentUser = securityContextService.getCurrentUser();
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

            log.info("Video deleted from S3. VideoId: {}", videoId);
        } catch (S3Exception e) {
            log.error("Failed to delete video from S3: {}", e.getMessage());
            // Continue to delete from database anyway
        }

        // Delete from database
        videoRepository.delete(video);
        return true;
    }



    // Helper methods

    private String generateS3Key(UUID instructorId, UUID lessonId, String filename) {
        String extension = filename.substring(filename.lastIndexOf('.'));
        String timestamp = System.currentTimeMillis() + "";
        return String.format("videos/%s/%s/%s%s", instructorId, lessonId, timestamp, extension);
    }

    /**
     * Map Video entity to VideoResponse DTO with stream URL
     */
    private VideoResponse mapToVideoResponse(Video video) {
        VideoResponse response = videoMapper.toVideoResponse(video);
        
        // Set stream URL if video is completed
        if (video.getProcessingStatus() == Video.ProcessingStatus.COMPLETED) {
            try {
                response.setStreamUrl(getVideoStreamUrl(video.getLesson().getLessonId()));
            } catch (Exception e) {
                log.warn("Failed to generate stream URL: {}", e.getMessage());
            }
        }
        
        return response;
    }

}
