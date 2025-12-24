package com.seikyuuressha.lms.mapper;

import com.seikyuuressha.lms.dto.response.ReviewResponse;
import com.seikyuuressha.lms.entity.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface ReviewMapper {

    @Mapping(target = "courseId", source = "course.courseId")
    @Mapping(target = "user", source = "user")
    ReviewResponse toReviewResponse(Review review);
}
