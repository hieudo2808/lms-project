package com.seikyuuressha.lms.dto.request;

import lombok.Data;

@Data
public class UpdateCategoryInput {
    private String name;
    private String slug;
    private String description;
}
