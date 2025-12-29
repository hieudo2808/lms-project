 package com.seikyuuressha.lms.repository;

import com.seikyuuressha.lms.entity.Quiz;
import com.seikyuuressha.lms.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    List<Quiz> findByCourseAndIsPublishedOrderByOrderIndexAsc(Course course, Boolean isPublished);
    List<Quiz> findByCourseOrderByOrderIndexAsc(Course course);
    List<Quiz> findByLesson_LessonIdAndIsPublishedOrderByOrderIndex(UUID lessonId, Boolean isPublished);

    List<Quiz> findByLesson_LessonIdOrderByOrderIndex(UUID lessonId);
    
    @Modifying
    @Query(value = """
        DELETE FROM QuizAnswerSelections 
        WHERE quizAnswerId IN (
            SELECT qa.quizAnswerId FROM QuizAnswers qa
            INNER JOIN QuizAttempts qat ON qa.attemptId = qat.attemptId
            INNER JOIN Quizzes q ON qat.quizId = q.quizId
            WHERE q.lessonId = :lessonId
        )
    """, nativeQuery = true)
    void deleteQuizAnswerSelectionsByLessonId(@Param("lessonId") UUID lessonId);

    @Modifying
    @Query(value = """
        DELETE FROM QuizAnswers 
        WHERE attemptId IN (
            SELECT qat.attemptId FROM QuizAttempts qat
            INNER JOIN Quizzes q ON qat.quizId = q.quizId
            WHERE q.lessonId = :lessonId
        )
    """, nativeQuery = true)
    void deleteQuizAnswersByLessonId(@Param("lessonId") UUID lessonId);

    @Modifying
    @Query(value = """
        DELETE FROM QuizAttempts 
        WHERE quizId IN (
            SELECT q.quizId FROM Quizzes q WHERE q.lessonId = :lessonId
        )
    """, nativeQuery = true)
    void deleteQuizAttemptsByLessonId(@Param("lessonId") UUID lessonId);

    @Modifying
    @Query(value = """
        DELETE FROM Answers 
        WHERE questionId IN (
            SELECT que.questionId FROM Questions que
            INNER JOIN Quizzes q ON que.quizId = q.quizId
            WHERE q.lessonId = :lessonId
        )
    """, nativeQuery = true)
    void deleteAnswersByLessonId(@Param("lessonId") UUID lessonId);

    @Modifying
    @Query(value = """
        DELETE FROM Questions 
        WHERE quizId IN (
            SELECT q.quizId FROM Quizzes q WHERE q.lessonId = :lessonId
        )
    """, nativeQuery = true)
    void deleteQuestionsByLessonId(@Param("lessonId") UUID lessonId);

    void deleteByLesson_LessonId(UUID lessonId);
}
