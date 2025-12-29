package com.seikyuuressha.lms.repository;

import com.seikyuuressha.lms.entity.Review;
import com.seikyuuressha.lms.entity.Course;
import com.seikyuuressha.lms.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByCourseAndIsActiveOrderByCreatedAtDesc(Course course, Boolean isActive);
    
    Optional<Review> findByUserAndCourse(Users user, Course course);
    
    List<Review> findByUserOrderByCreatedAtDesc(Users user);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.course = :course AND r.isActive = true")
    Double getAverageRatingForCourse(Course course);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.course = :course AND r.isActive = true")
    Long getReviewCountForCourse(Course course);
}
