package com.seikyuuressha.lms.mapper;

import com.seikyuuressha.lms.dto.response.CoInstructorResponse;
import com.seikyuuressha.lms.dto.response.CourseResponse;
import com.seikyuuressha.lms.entity.Course;
import com.seikyuuressha.lms.entity.CourseInstructor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface CourseMapper {

    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "instructor", source = "instructor")
    @Mapping(target = "isPublished", source = "published")
    @Mapping(target = "modules", ignore = true)
    @Mapping(target = "coInstructors", ignore = true)
    @Mapping(target = "totalLessons", ignore = true)
    @Mapping(target = "totalDuration", ignore = true)
    CourseResponse toCourseResponse(Course course);

    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "instructor", source = "instructor")
    @Mapping(target = "isPublished", source = "published")
    @Mapping(target = "modules", ignore = true)
    @Mapping(target = "coInstructors", ignore = true)
    @Mapping(target = "totalLessons", ignore = true)
    @Mapping(target = "totalDuration", ignore = true)
    CourseResponse toCourseResponseWithoutModules(Course course);

    @Mapping(target = "userId", source = "user.userId")
    @Mapping(target = "fullName", source = "user.fullName")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "avatarUrl", source = "user.avatarUrl")
    @Mapping(target = "role", source = "userRole")
    CoInstructorResponse toCoInstructorResponse(CourseInstructor courseInstructor);

    default Integer calculateTotalLessons(Course course) {
        if (course.getModules() == null) return 0;
        return course.getModules().stream()
                .mapToInt(m -> m.getLessons() != null ? m.getLessons().size() : 0)
                .sum();
    }

    default Integer calculateTotalDuration(Course course) {
        if (course.getModules() == null) return 0;
        return course.getModules().stream()
                .flatMap(m -> m.getLessons() != null ? m.getLessons().stream() : java.util.stream.Stream.empty())
                .mapToInt(l -> l.getDurationSeconds() != null ? l.getDurationSeconds() : 0)
                .sum();
    }
}
