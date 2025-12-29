ackage com.seikyuuressha.lms.dto.request;

import com.seikyuuressha.lms.entity.Question;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateQuestionRequest {
    @NotNull(message = "Quiz ID is required")
    UUID quizId;

    @NotNull(message = "Question type is required")
    Question.QuestionType questionType;

    @NotBlank(message = "Question text is required")
    String questionText;

    String explanation;

    @NotNull(message = "Points are required")
    Integer points;
}
