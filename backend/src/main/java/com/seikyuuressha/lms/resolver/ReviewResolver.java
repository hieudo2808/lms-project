package com.seikyuuressha.lms.resolver;

import com.seikyuuressha.lms.dto.request.CreateReviewRequest;
import com.seikyuuressha.lms.dto.request.UpdateReviewRequest;
import com.seikyuuressha.lms.dto.response.ReviewResponse;
import com.seikyuuressha.lms.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class ReviewResolver {

    private final ReviewService reviewService;

    @QueryMapping
    public List<ReviewResponse> getReviewsByCourse(@Argument UUID courseId) {
        return reviewService.getReviewsByCourse(courseId);
    }

    @QueryMapping
    public Double getCourseAverageRating(@Argument UUID courseId) {
        return reviewService.getCourseAverageRating(courseId);
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public ReviewResponse myReviewForCourse(@Argument UUID courseId) {
        return reviewService.getMyReviewForCourse(courseId);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public ReviewResponse createReview(@Argument CreateReviewRequest input) {
        return reviewService.createReview(input);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public ReviewResponse updateReview(@Argument UUID reviewId, @Argument UpdateReviewRequest input) {
        return reviewService.updateReview(reviewId, input);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public Boolean deleteReview(@Argument UUID reviewId) {
        return reviewService.deleteReview(reviewId);
    }
}
