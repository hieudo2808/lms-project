ackage com.seikyuuressha.lms.mapper;

import com.seikyuuressha.lms.dto.response.LessonResponse;
import com.seikyuuressha.lms.dto.response.ModuleResponse;
import com.seikyuuressha.lms.entity.Lesson;
import com.seikyuuressha.lms.entity.Module;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ModuleMapper {

    @Mapping(target = "order", source = "sortOrder")
    @Mapping(target = "lessons", ignore = true)
    ModuleResponse toModuleResponse(Module module);

    @Mapping(target = "order", source = "sortOrder")
    @Mapping(target = "lessons", source = "lessons", qualifiedByName = "lessonListToResponse")
    ModuleResponse toModuleResponseWithLessons(Module module);

    @Named("lessonListToResponse")
    default List<LessonResponse> mapLessons(List<Lesson> lessons) {
        if (lessons == null) return null;
        return lessons.stream()
                .sorted(Comparator.comparingInt(Lesson::getSortOrder))
                .map(lesson -> LessonResponse.builder()
                        .lessonId(lesson.getLessonId())
                        .title(lesson.getTitle())
                        .content(lesson.getContent())
                        .durationSeconds(lesson.getDurationSeconds())
                        .order(lesson.getSortOrder())
                        .userProgress(0.0)
                        .build())
                .collect(Collectors.toList());
    }
}
