package com.seikyuuressha.lms.dto.response;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private UUID categoryId;
    private String name;
    private String slug;
    private String description;
}
