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
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    @Transactional
    public ReviewResponse createReview(CreateReviewRequest request) {
        UUID userId = getCurrentUserId();
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Check if user already reviewed this course
        Optional<Review> existingReview = reviewRepository.findByUserAndCourse(user, course);
        if (existingReview.isPresent() && existingReview.get().getIsActive()) {
            throw new RuntimeException("You have already reviewed this course");
        }

        // Create new review - let Hibernate generate ID
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
        UUID userId = getCurrentUserId();
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
        review.setUpdatedAt(OffsetDateTime.now()); // Explicitly set updatedAt

        review = reviewRepository.save(review);
        return reviewMapper.toReviewResponse(review);
    }

    @Transactional
    public Boolean deleteReview(UUID reviewId) {
        UUID userId = getCurrentUserId();
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
        UUID userId = getCurrentUserId();
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Review review = reviewRepository.findByUserAndCourse(user, course)
                .orElse(null);

        return review != null && review.getIsActive() ? reviewMapper.toReviewResponse(review) : null;
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userIdStr = authentication.getName();
        
        try {
            // Token chứa UUID -> Parse trực tiếp
            return UUID.fromString(userIdStr);
        } catch (IllegalArgumentException e) {
            // Fallback: Nếu token chứa email (trường hợp cũ)
            Users user = userRepository.findByEmail(userIdStr)
                    .orElseThrow(() -> new RuntimeException("User not found by email/id: " + userIdStr));
            return user.getUserId();
        }
    }
}
