package com.example.kursovayabackend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserProfileDto {
    private Long userId;
    private String email;
    private LocalDateTime createdAt;
}