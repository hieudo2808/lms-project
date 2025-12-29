ackage com.seikyuuressha.lms.dto.response;

import com.seikyuuressha.lms.entity.QuizAttempt;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizAttemptResponse {
    UUID attemptId;
    UUID userId;
    QuizResponse quiz;
    Integer attemptNumber;
    OffsetDateTime startTime;
    OffsetDateTime endTime;
    Integer totalScore;
    Integer maxScore;
    Double percentage;
    QuizAttempt.AttemptStatus status;
    Boolean passed;
    List<QuizAnswerResponse> userAnswers;
}
