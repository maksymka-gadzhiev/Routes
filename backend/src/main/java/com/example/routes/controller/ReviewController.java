package com.example.routes.controller;

import com.example.routes.dto.request.ReviewRequest;
import com.example.routes.dto.response.ReviewResponse;
import com.example.routes.security.UserDetailsImpl;
import com.example.routes.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes/{routeId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/{userId}")
    public ResponseEntity<ReviewResponse> addReview(
            @PathVariable Long routeId,
            @RequestBody ReviewRequest request, @PathVariable Long userId) {

        return ResponseEntity.ok(reviewService.addReview(routeId, userId, request));
    }

    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getRouteReviews(@PathVariable Long routeId) {
        return ResponseEntity.ok(reviewService.getRouteReviews(routeId));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long routeId,
            @PathVariable Long reviewId) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getUserId();

        reviewService.deleteReview(reviewId, userId);
        return ResponseEntity.noContent().build();
    }
}