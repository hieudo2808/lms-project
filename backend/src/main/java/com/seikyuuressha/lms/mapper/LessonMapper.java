package com.seikyuuressha.lms.mapper;

import com.seikyuuressha.lms.dto.response.LessonResponse;
import com.seikyuuressha.lms.entity.Lesson;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LessonMapper {

    @Mapping(target = "order", source = "sortOrder")
    @Mapping(target = "videoUrl", ignore = true)
    @Mapping(target = "userProgress", ignore = true)
    LessonResponse toLessonResponse(Lesson lesson);

    @Mapping(target = "order", source = "sortOrder")
    @Mapping(target = "videoUrl", ignore = true)
    @Mapping(target = "userProgress", constant = "0.0")
    LessonResponse toLessonResponseSimple(Lesson lesson);
}
