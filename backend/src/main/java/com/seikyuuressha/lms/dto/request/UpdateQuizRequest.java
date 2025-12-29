ackage com.seikyuuressha.lms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateQuizRequest {
    @NotBlank(message = "Title is required")
    String title;

    String description;

    @NotNull(message = "Passing score is required")
    Integer passingScore;

    Integer timeLimit;

    Integer maxAttempts;

    @NotNull(message = "Published status is required")
    Boolean isPublished;
}