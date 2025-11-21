package com.seikyuuressha.lms.dto.response;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonResponse {
    private UUID lessonId;
    private String title;
    private String videoUrl; // Will be null for non-enrolled users
    private String content;
    private Integer durationSeconds;
    private int order;
    private Double userProgress; // Progress percentage for current user
}
