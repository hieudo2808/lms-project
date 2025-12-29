package com.seikyuuressha.lms.service;

import com.seikyuuressha.lms.dto.request.CreateReviewRequest;
import com.seikyuuressha.lms.dto.request.UpdateReviewRequest;
import com.seikyuuressha.lms.dto.response.ReviewResponse;
import com.seikyuuressha.lms.entity.Course;
import com.seikyuuressha.lms.entity.Review;
import com.seikyuuressha.lms.entity.Users;
import com.seikyuuressha.lms.mapper.ReviewMapper;
import com.seikyuuressha.lms.repository.CourseRepository;
import com.seikyuuressha.lms.repository.ReviewRepository;
import com.seikyuuressha.lms.repository.UserRepository;
import com.seikyuuressha.lms.service.common.SecurityContextService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final ReviewMapper reviewMapper;
    private final SecurityContextService securityContextService;

    @Transactional
    public ReviewResponse createReview(CreateReviewRequest request) {
        UUID userId = securityContextService.getCurrentUserId();
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Optional<Review> existingReview = reviewRepository.findByUserAndCourse(user, course);
        if (existingReview.isPresent() && existingReview.get().getIsActive()) {
            throw new RuntimeException("You have already reviewed this course");
        }

        Review review = Review.builder()
                .course(course)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment())
                .isActive(true)
                .build();

        review = reviewRepository.save(review);
        return reviewMapper.toReviewResponse(review);
    }

    @Transactional
    public ReviewResponse updateReview(UUID reviewId, UpdateReviewRequest request) {
        UUID userId = securityContextService.getCurrentUserId();
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("You can only edit your own reviews");
        }

        if (!review.getIsActive()) {
            throw new RuntimeException("Cannot edit inactive review");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setUpdatedAt(OffsetDateTime.now());

        review = reviewRepository.save(review);
        return reviewMapper.toReviewResponse(review);
    }

    @Transactional
    public Boolean deleteReview(UUID reviewId) {
        UUID userId = securityContextService.getCurrentUserId();
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("You can only delete your own reviews");
        }

        review.setIsActive(false);
        reviewRepository.save(review);
        return true;
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByCourse(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        List<Review> reviews = reviewRepository
                .findByCourseAndIsActiveOrderByCreatedAtDesc(course, true);

        return reviews.stream()
                .map(reviewMapper::toReviewResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Double getCourseAverageRating(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        return reviewRepository.getAverageRatingForCourse(course);
    }

    @Transactional(readOnly = true)
    public ReviewResponse getMyReviewForCourse(UUID courseId) {
        UUID userId = securityContextService.getCurrentUserId();
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Review review = reviewRepository.findByUserAndCourse(user, course)
                .orElse(null);

        return review != null && review.getIsActive() ? reviewMapper.toReviewResponse(review) : null;
    }

}
