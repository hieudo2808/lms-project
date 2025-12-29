package com.seikyuuressha.lms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateCategoryRequest {
    @NotBlank(message = "Tên danh mục không được để trống")
    String name;

    @NotBlank(message = "Slug không được để trống")
    String slug;

    String description;
}
