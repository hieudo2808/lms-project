ackage com.seikyuuressha.lms.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateCategoryRequest {
    String name;
    String slug;
    String description;
}
