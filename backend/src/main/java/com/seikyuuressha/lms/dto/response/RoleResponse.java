ackage com.seikyuuressha.lms.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleResponse {
    UUID roleId;
    String roleName;
}
