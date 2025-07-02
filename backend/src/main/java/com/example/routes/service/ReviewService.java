package com.example.routes.service;

import com.example.routes.dto.request.ReviewRequest;
import com.example.routes.dto.response.ReviewResponse;
import com.example.routes.entity.*;
import com.example.routes.exception.CustomAuthenticationException;
import com.example.routes.exception.ResourceNotFoundException;
import com.example.routes.repository.ReviewRepository;
import com.example.routes.repository.RouteRepository;
import com.example.routes.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final RouteRepository routeRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReviewResponse addReview(Long routeId, Long userId, ReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found"));

        Review review = new Review();
        review.setComment(request.getComment());
        review.setRating(request.getRating());
        review.setReviewDate(LocalDateTime.now());
        review.setUser(user);
        review.setRoute(route);

        Review savedReview = reviewRepository.save(review);
        updateRouteAverageRating(route);
        return convertToResponse(savedReview);
    }

    public List<ReviewResponse> getRouteReviews(Long routeId) {
        List<Review> reviews = reviewRepository.findByRouteRouteId(routeId);
        return reviews.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getUser().getUserId().equals(userId)) {
            throw new CustomAuthenticationException("User not authorized to delete this review");
        }

        Route route = review.getRoute();
        reviewRepository.delete(review);
        updateRouteAverageRating(route);
    }

    private void updateRouteAverageRating(Route route) {
        List<Review> reviews = reviewRepository.findByRouteRouteId(route.getRouteId());
        if (reviews.isEmpty()) {
            route.setAvgRating(null);
        } else {
            double average = reviews.stream()
                    .mapToDouble(Review::getRating)
                    .average()
                    .orElse(0.0);
            route.setAvgRating(average);
        }
        routeRepository.save(route);
    }

    private ReviewResponse convertToResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setReviewId(review.getReviewId());
        response.setComment(review.getComment());
        response.setRating(review.getRating());
        response.setReviewDate(review.getReviewDate());
        response.setUserId(review.getUser().getUserId());
        response.setUsername(review.getUser().getUsername());
        return response;
    }
}