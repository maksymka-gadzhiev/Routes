package com.example.kursovayabackend.entity;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class Route {
    private Long routeId;
    private String title;
    private String description;
    private String visibility;
    private String status;
    private String difficulty;
    private Double avgRating;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<Coordinate> coordinates;
}
