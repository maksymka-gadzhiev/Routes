package com.example.routes.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FriendResponse {
    private Long userId;
    private String username;
    private String email;
}