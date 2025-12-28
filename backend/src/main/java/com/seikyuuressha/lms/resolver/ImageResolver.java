package com.seikyuuressha.lms.resolver;

import com.seikyuuressha.lms.dto.response.PresignedUrlResponse;
import com.seikyuuressha.lms.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ImageResolver {

    private final ImageService imageService;

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public PresignedUrlResponse generateImageUploadUrl(
            @Argument String fileName,
            @Argument String contentType) {
        return imageService.generateImageUploadUrl(fileName, contentType);
    }
}
