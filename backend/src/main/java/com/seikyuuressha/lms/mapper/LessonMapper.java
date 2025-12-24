package com.seikyuuressha.lms.mapper;

import com.seikyuuressha.lms.dto.response.LessonResponse;
import com.seikyuuressha.lms.entity.Lesson;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LessonMapper {

    @Mapping(target = "order", source = "sortOrder")
    @Mapping(target = "videoUrl", ignore = true) // Set manually based on enrollment
    @Mapping(target = "userProgress", ignore = true) // Set manually based on progress
    LessonResponse toLessonResponse(Lesson lesson);

    // Simple mapping for instructor view (no enrollment check needed)
    @Mapping(target = "order", source = "sortOrder")
    @Mapping(target = "videoUrl", ignore = true)
    @Mapping(target = "userProgress", constant = "0.0")
    LessonResponse toLessonResponseSimple(Lesson lesson);
}
