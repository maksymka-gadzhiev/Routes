package com.example.routes.dto.response;

import com.example.routes.entity.User;
import lombok.Data;

@Data
public class AuthResponse {
    private String token;
    private Long userId;
    private String username;
    private String email;
    private Integer routesCount;
    private Double totalDistance;

    public AuthResponse(String token, User user) {
        this.token = token;
        this.userId = user.getUserId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.routesCount = user.getRoutesCount();
        this.totalDistance = user.getTotalDistance();
    }
}