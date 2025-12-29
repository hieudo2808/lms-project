ackage com.seikyuuressha.lms.dto.request;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProgressRequest {
    private Integer watchedSeconds;
    private Double progressPercent;
}
