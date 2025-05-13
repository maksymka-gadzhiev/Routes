package com.example.kursovayabackend.entity;

import lombok.Data;

import java.time.LocalDateTime;
@Data
public class Invite {
    private Long inviteId;
    private LocalDateTime createAt;
    private Long userFromId;
    private Long userToId;
}
