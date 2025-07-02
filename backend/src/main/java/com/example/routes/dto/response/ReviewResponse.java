package com.example.routes.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewResponse {
    private Long reviewId;
    private String comment;
    private Double rating;
    private LocalDateTime reviewDate;
    private Long userId;
    private String username;
}
