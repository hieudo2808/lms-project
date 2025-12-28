package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.response.PresignedUrlResponse;
import com.seikyuuressha.lms.entity.Users;
import com.seikyuuressha.lms.service.common.SecurityContextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageService {

    private final SecurityContextService securityContextService;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.presigned-url-expiration:3600}")
    private Long presignedUrlExpiration;

    @Value("${aws.s3.region}")
    private String region;

    /**
     * Generate pre-signed URL for image upload (avatar, thumbnails, etc.)
     */
    public PresignedUrlResponse generateImageUploadUrl(String fileName, String contentType) {
        Users currentUser = securityContextService.getCurrentUser();

        // Generate unique S3 key for images
        String fileExtension = getFileExtension(fileName);
        String s3Key = String.format("images/avatars/%s/%s.%s", 
                currentUser.getUserId(), 
                UUID.randomUUID(), 
                fileExtension);

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofSeconds(presignedUrlExpiration))
                .putObjectRequest(putObjectRequest)
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);

        // Generate public URL (assuming bucket is configured for public read)
        String publicUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", 
                bucketName, region, s3Key);

        return PresignedUrlResponse.builder()
                .uploadUrl(presignedRequest.url().toString())
                .s3Key(s3Key)
                .publicUrl(publicUrl)
                .expiresIn(presignedUrlExpiration)
                .build();
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "jpg";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }
}

