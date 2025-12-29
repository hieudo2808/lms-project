package com.seikyuuressha.lms.resolver;

import com.seikyuuressha.lms.dto.request.VideoUploadRequest;
import com.seikyuuressha.lms.dto.response.PresignedUrlResponse;
import com.seikyuuressha.lms.dto.response.VideoResponse;
import com.seikyuuressha.lms.service.VideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class VideoResolver {

    private final VideoService videoService;

    
    @MutationMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public PresignedUrlResponse generateVideoUploadUrl(@Argument VideoUploadRequest input) {
        return videoService.generateUploadUrl(input);
    }

    
    @MutationMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public VideoResponse confirmVideoUpload(@Argument UUID videoId, @Argument Integer durationSeconds) {
        return videoService.confirmUpload(videoId, durationSeconds);
    }

    
    @MutationMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public Boolean deleteVideo(@Argument UUID videoId) {
        return videoService.deleteVideo(videoId);
    }

    
    @QueryMapping
    public String getVideoStreamUrl(@Argument UUID lessonId) {
        return videoService.getVideoStreamUrl(lessonId);
    }

    
    @QueryMapping
    public VideoResponse getVideoByLesson(@Argument UUID lessonId) {
        return videoService.getVideoByLesson(lessonId);
    }

    
    @QueryMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public List<VideoResponse> getMyVideos() {
        return videoService.getMyVideos();
    }
}
