package com.seikyuuressha.lms.resolver;

import com.seikyuuressha.lms.dto.request.CreateCommentRequest;
import com.seikyuuressha.lms.dto.request.UpdateCommentRequest;
import com.seikyuuressha.lms.dto.response.CommentResponse;
import com.seikyuuressha.lms.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class CommentResolver {

    private final CommentService commentService;

    @QueryMapping
    public List<CommentResponse> getCommentsByLesson(@Argument UUID lessonId) {
        return commentService.getCommentsByLesson(lessonId);
    }

    @QueryMapping
    public List<CommentResponse> getCommentReplies(@Argument UUID commentId) {
        return commentService.getCommentReplies(commentId);
    }

    @MutationMapping
    public CommentResponse createComment(@Argument CreateCommentRequest input) {
        return commentService.createComment(input);
    }

    @MutationMapping
    public CommentResponse updateComment(@Argument UUID commentId, @Argument UpdateCommentRequest input) {
        return commentService.updateComment(commentId, input);
    }

    @MutationMapping
    public Boolean deleteComment(@Argument UUID commentId) {
        return commentService.deleteComment(commentId);
    }
}
