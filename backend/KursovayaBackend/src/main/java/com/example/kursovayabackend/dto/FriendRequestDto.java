package com.example.kursovayabackend.dto;

import lombok.Data;

@Data
public class FriendRequestDto {
    private Long senderId;
    private String receiverLogin;
}
