package com.example.routes.dto.request;

import lombok.Data;

@Data
public class ReviewRequest {
    private String comment;
    private Double rating;
}