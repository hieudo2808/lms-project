ackage com.seikyuuressha.lms.resolver;

import com.seikyuuressha.lms.entity.LessonResource;
import com.seikyuuressha.lms.service.LessonResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class LessonResourceResolver {

    private final LessonResourceService lessonResourceService;

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<Map<String, Object>> getLessonResources(@Argument UUID lessonId) {
        return lessonResourceService.getResourcesByLesson(lessonId);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public Map<String, String> generateResourceUploadUrl(
            @Argument UUID lessonId,
            @Argument String fileName,
            @Argument String contentType) {
        return lessonResourceService.generateUploadUrl(lessonId, fileName, contentType);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public Map<String, Object> confirmResourceUpload(
            @Argument UUID lessonId,
            @Argument String s3Key,
            @Argument String fileName,
            @Argument String resourceType,
            @Argument Long fileSize) {
        LessonResource resource = lessonResourceService.confirmUpload(lessonId, s3Key, fileName, resourceType, fileSize);
        return Map.of(
                "resourceId", resource.getResourceId(),
                "lessonId", resource.getLesson().getLessonId(),
                "fileName", resource.getFileName(),
                "resourceType", resource.getResourceType(),
                "fileSize", resource.getFileSize() != null ? resource.getFileSize() : 0L
        );
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public boolean deleteLessonResource(@Argument UUID resourceId) {
        return lessonResourceService.deleteResource(resourceId);
    }
}
