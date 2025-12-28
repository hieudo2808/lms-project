package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.request.CreateCommentRequest;
import com.seikyuuressha.lms.dto.request.UpdateCommentRequest;
import com.seikyuuressha.lms.dto.response.CommentResponse;
import com.seikyuuressha.lms.dto.response.UserResponse;
import com.seikyuuressha.lms.entity.Comment;
import com.seikyuuressha.lms.entity.Lesson;
import com.seikyuuressha.lms.entity.Users;
import com.seikyuuressha.lms.repository.CommentRepository;
import com.seikyuuressha.lms.repository.LessonRepository;
import com.seikyuuressha.lms.repository.UserRepository;
import com.seikyuuressha.lms.service.common.SecurityContextService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final SecurityContextService securityContextService;

    @Transactional
    public CommentResponse createComment(CreateCommentRequest request) {
        UUID userId = securityContextService.getCurrentUserId();
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        Comment parentComment = null;
        if (request.getParentCommentId() != null) {
            parentComment = commentRepository.findById(request.getParentCommentId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
        }

        // Create new comment - let Hibernate generate ID
        Comment comment = Comment.builder()
                .lesson(lesson)
                .user(user)
                .content(request.getContent())
                .parentComment(parentComment)
                .isActive(true)
                .build();

        comment = commentRepository.save(comment);
        return mapToResponse(comment);
    }

    @Transactional
    public CommentResponse updateComment(UUID commentId, UpdateCommentRequest request) {
        UUID userId = securityContextService.getCurrentUserId();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("You can only edit your own comments");
        }

        comment.setContent(request.getContent());
        comment.setUpdatedAt(OffsetDateTime.now()); // Explicitly set updatedAt

        comment = commentRepository.save(comment);
        return mapToResponse(comment);
    }

    @Transactional
    public Boolean deleteComment(UUID commentId) {
        UUID userId = securityContextService.getCurrentUserId();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("You can only delete your own comments");
        }

        comment.setIsActive(false);
        commentRepository.save(comment);
        return true;
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByLesson(UUID lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        List<Comment> comments = commentRepository
                .findByLessonAndParentCommentIsNullAndIsActiveOrderByCreatedAtDesc(lesson, true);

        return comments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentReplies(UUID commentId) {
        Comment parentComment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        List<Comment> replies = commentRepository
                .findByParentCommentAndIsActiveOrderByCreatedAtAsc(parentComment, true);

        return replies.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private CommentResponse mapToResponse(Comment comment) {
        UserResponse userResponse = UserResponse.builder()
                .userId(comment.getUser().getUserId())
                .fullName(comment.getUser().getFullName())
                .email(comment.getUser().getEmail())
                .avatarUrl(comment.getUser().getAvatarUrl())
                .bio(comment.getUser().getBio())
                .roleName(comment.getUser().getRole().getRoleName())
                .createdAt(comment.getUser().getCreatedAt())
                .isActive(comment.getUser().isActive())
                .build();

        // Map parent comment if exists
        CommentResponse parentCommentResponse = null;
        if (comment.getParentComment() != null) {
            Comment parent = comment.getParentComment();
            UserResponse parentUserResponse = UserResponse.builder()
                    .userId(parent.getUser().getUserId())
                    .fullName(parent.getUser().getFullName())
                    .email(parent.getUser().getEmail())
                    .avatarUrl(parent.getUser().getAvatarUrl())
                    .bio(parent.getUser().getBio())
                    .roleName(parent.getUser().getRole().getRoleName())
                    .createdAt(parent.getUser().getCreatedAt())
                    .isActive(parent.getUser().isActive())
                    .build();

            parentCommentResponse = CommentResponse.builder()
                    .commentId(parent.getCommentId())
                    .lessonId(parent.getLesson().getLessonId())
                    .user(parentUserResponse)
                    .content(parent.getContent())
                    .parentCommentId(parent.getParentComment() != null 
                            ? parent.getParentComment().getCommentId() : null)
                    .parentComment(null) // Don't recurse deeper
                    .isActive(parent.getIsActive())
                    .createdAt(parent.getCreatedAt())
                    .updatedAt(parent.getUpdatedAt())
                    .build();
        }

        // Load replies if this is a top-level comment
        List<CommentResponse> replies = null;
        if (comment.getParentComment() == null) {
            List<Comment> replyComments = commentRepository
                    .findByParentCommentAndIsActiveOrderByCreatedAtAsc(comment, true);
            
            if (!replyComments.isEmpty()) {
                replies = replyComments.stream()
                        .map(reply -> {
                            UserResponse replyUserResponse = UserResponse.builder()
                                    .userId(reply.getUser().getUserId())
                                    .fullName(reply.getUser().getFullName())
                                    .email(reply.getUser().getEmail())
                                    .avatarUrl(reply.getUser().getAvatarUrl())
                                    .bio(reply.getUser().getBio())
                                    .roleName(reply.getUser().getRole().getRoleName())
                                    .createdAt(reply.getUser().getCreatedAt())
                                    .isActive(reply.getUser().isActive())
                                    .build();

                            return CommentResponse.builder()
                                    .commentId(reply.getCommentId())
                                    .lessonId(reply.getLesson().getLessonId())
                                    .user(replyUserResponse)
                                    .content(reply.getContent())
                                    .parentCommentId(comment.getCommentId())
                                    .parentComment(null) // Don't include full parent in replies
                                    .replies(null) // No nested replies
                                    .isActive(reply.getIsActive())
                                    .createdAt(reply.getCreatedAt())
                                    .updatedAt(reply.getUpdatedAt())
                                    .build();
                        })
                        .collect(Collectors.toList());
            }
        }

        return CommentResponse.builder()
                .commentId(comment.getCommentId())
                .lessonId(comment.getLesson().getLessonId())
                .user(userResponse)
                .content(comment.getContent())
                .parentCommentId(comment.getParentComment() != null 
                        ? comment.getParentComment().getCommentId() : null)
                .parentComment(parentCommentResponse)
                .replies(replies)
                .isActive(comment.getIsActive())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

}
