ackage com.seikyuuressha.lms.dto.response;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuleResponse {
    private UUID moduleId;
    private String title;
    private int order;
    private List<LessonResponse> lessons;
}
