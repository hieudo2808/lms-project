package com.seikyuuressha.lms.repository;

import com.seikyuuressha.lms.entity.QuizAttempt;
import com.seikyuuressha.lms.entity.Quiz;
import com.seikyuuressha.lms.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, UUID> {
    List<QuizAttempt> findByUserAndQuizOrderByAttemptNumberDesc(Users user, Quiz quiz);
    Optional<QuizAttempt> findByUserAndQuizAndStatus(Users user, Quiz quiz, QuizAttempt.AttemptStatus status);
    Integer countByUserAndQuiz(Users user, Quiz quiz);
    List<QuizAttempt> findByUserOrderByStartedAtDesc(Users user);
}
