package com.seikyuuressha.lms.repository;

import com.seikyuuressha.lms.entity.Question;
import com.seikyuuressha.lms.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuestionRepository extends JpaRepository<Question, UUID> {
    List<Question> findByQuizOrderByOrderIndexAsc(Quiz quiz);
}
