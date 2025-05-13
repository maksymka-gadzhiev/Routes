package com.example.kursovayabackend.entity;

import lombok.Data;

@Data
public class UserEntity {
    private Long userId;

    private String email;

    private String password;
}