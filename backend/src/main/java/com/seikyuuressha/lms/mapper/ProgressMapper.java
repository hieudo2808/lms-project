package com.seikyuuressha.lms.mapper;

import com.seikyuuressha.lms.dto.response.ProgressResponse;
import com.seikyuuressha.lms.entity.Progress;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProgressMapper {

    @Mapping(target = "lessonId", source = "lesson.lessonId")
    @Mapping(target = "lessonTitle", source = "lesson.title")
    ProgressResponse toProgressResponse(Progress progress);
}
