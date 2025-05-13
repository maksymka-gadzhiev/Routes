package com.example.kursovayabackend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FriendDto {
    private Long friendshipId;
    private String friendEmail;
    private LocalDateTime createAt;
    private Long firstUserId;
    private Long secondUserId;
}
