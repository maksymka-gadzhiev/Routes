package com.example.kursovayabackend.entity;

import lombok.Data;

import java.time.LocalDateTime;
@Data
public class Review {
    private Long reviewId;
    private String comment;
    private LocalDateTime reviewDate;
    private Double rating;
    private Long userId;
    private Long routeId;
}
