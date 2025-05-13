package com.example.kursovayabackend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InviteDto {
    private Long inviteId;
    private String senderEmail;
    private LocalDateTime createAt;
}
