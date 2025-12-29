package com.seikyuuressha.lms.mapper;

import com.seikyuuressha.lms.dto.response.CategoryResponse;
import com.seikyuuressha.lms.entity.Categories;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    CategoryResponse toCategoryResponse(Categories category);
}
