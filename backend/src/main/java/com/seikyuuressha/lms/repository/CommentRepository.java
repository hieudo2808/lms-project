package com.seikyuuressha.lms.repository;

import com.seikyuuressha.lms.entity.Comment;
import com.seikyuuressha.lms.entity.Lesson;
import com.seikyuuressha.lms.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findByLessonAndIsActiveOrderByCreatedAtDesc(Lesson lesson, Boolean isActive);
    List<Comment> findByLessonAndParentCommentIsNullAndIsActiveOrderByCreatedAtDesc(Lesson lesson, Boolean isActive);
    List<Comment> findByParentCommentAndIsActiveOrderByCreatedAtAsc(Comment parentComment, Boolean isActive);
    List<Comment> findByUserOrderByCreatedAtDesc(Users user);
}
