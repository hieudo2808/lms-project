package com.seikyuuressha.lms.repository;

import com.seikyuuressha.lms.entity.QuizAnswer;
import com.seikyuuressha.lms.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizAnswerRepository extends JpaRepository<QuizAnswer, UUID> {
    List<QuizAnswer> findByAttempt(QuizAttempt attempt);
}
