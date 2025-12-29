ackage com.seikyuuressha.lms.mapper;

import com.seikyuuressha.lms.dto.response.VideoResponse;
import com.seikyuuressha.lms.entity.Video;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface VideoMapper {

    @Mapping(target = "lessonId", source = "lesson.lessonId")
    @Mapping(target = "processingStatus", expression = "java(video.getProcessingStatus().name())")
    @Mapping(target = "streamUrl", ignore = true)
    VideoResponse toVideoResponse(Video video);
}
