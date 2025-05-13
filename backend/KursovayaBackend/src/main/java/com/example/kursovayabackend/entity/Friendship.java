package com.example.kursovayabackend.entity;

import lombok.Data;

import java.time.LocalDateTime;
@Data
public class Friendship {
    private Long friendshipId;
    private LocalDateTime createAt;
    private Long firstUserId;
    private Long secondUserId;
}
