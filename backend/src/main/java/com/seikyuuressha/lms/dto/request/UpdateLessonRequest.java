ackage com.seikyuuressha.lms.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateLessonRequest {

    private String title;
    private String content;
    private String videoUrl;
    private Integer durationSeconds;
    private Integer order;
}
