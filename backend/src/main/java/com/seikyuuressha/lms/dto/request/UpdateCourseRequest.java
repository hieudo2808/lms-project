package com.seikyuuressha.lms.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCourseRequest {

    private String title;
    private String slug;
    private String description;
    private String thumbnailUrl;
    private String level;
    private BigDecimal price;
    private UUID categoryId;
}
