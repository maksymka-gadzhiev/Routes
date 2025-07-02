package com.example.routes.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class InviteResponse {
    private Long inviteId;
    private Long userFromId;
    private String userFromUsername;
    private LocalDateTime createdAt;
}
