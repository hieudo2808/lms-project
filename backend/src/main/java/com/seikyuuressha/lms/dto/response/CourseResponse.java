package com.seikyuuressha.lms.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponse {
    private UUID courseId;
    private String title;
    private String slug;
    private String description;
    private String thumbnailUrl;
    private String level;
    private BigDecimal price;
    private String categoryName;
    private InstructorResponse instructor;
    private List<CoInstructorResponse> coInstructors;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private boolean isPublished;
    private List<ModuleResponse> modules;
    private Integer totalLessons;
    private Integer totalDuration;
}
