package com.seikyuuressha.lms.mapper;

import com.seikyuuressha.lms.dto.response.CommentResponse;
import com.seikyuuressha.lms.entity.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface CommentMapper {

    @Mapping(target = "lessonId", source = "lesson.lessonId")
    @Mapping(target = "user", source = "user")
    @Mapping(target = "parentCommentId", source = "parentComment.commentId")
    @Mapping(target = "parentComment", ignore = true)
    @Mapping(target = "replies", ignore = true)
    CommentResponse toCommentResponse(Comment comment);

    List<CommentResponse> toCommentResponseList(List<Comment> comments);
}
