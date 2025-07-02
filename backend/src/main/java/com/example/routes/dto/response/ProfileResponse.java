package com.example.routes.dto.response;

import lombok.Data;

@Data
public class ProfileResponse {
    private Long userId;
    private String username;
    private String email;
    private Integer routesCount;
    private Double totalDistance;
}