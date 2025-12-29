package com.seikyuuressha.lms.dto.request;

import lombok.Data;

@Data
public class CreateCategoryInput {
    private String name;
    private String slug;
    private String description;
}
