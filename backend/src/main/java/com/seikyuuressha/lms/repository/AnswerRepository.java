package com.seikyuuressha.lms.repository;

import com.seikyuuressha.lms.entity.Answer;
import com.seikyuuressha.lms.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, UUID> {
    List<Answer> findByQuestionOrderByOrderIndexAsc(Question question);
}
