ackage com.seikyuuressha.lms.resolver;

import com.seikyuuressha.lms.dto.request.UpdateProgressRequest;
import com.seikyuuressha.lms.dto.response.ProgressResponse;
import com.seikyuuressha.lms.service.ProgressService;
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
public class ProgressResolver {

    private final ProgressService progressService;

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public ProgressResponse updateProgress(@Argument UUID lessonId, 
                                          @Argument("input") UpdateProgressRequest input) {
        return progressService.updateProgress(lessonId, input);
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<ProgressResponse> myProgress(@Argument UUID courseId) {
        return progressService.getMyProgress(courseId);
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public ProgressResponse getLessonProgress(@Argument UUID lessonId) {
        return progressService.getLessonProgress(lessonId);
    }
}
