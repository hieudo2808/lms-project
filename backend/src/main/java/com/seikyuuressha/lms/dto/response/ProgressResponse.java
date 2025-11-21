package com.seikyuuressha.lms.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressResponse {
    private UUID progressId;
    private UUID lessonId;
    private String lessonTitle;
    private Integer watchedSeconds;
    private Double progressPercent;
    private LocalDateTime lastWatchedAt;
}
