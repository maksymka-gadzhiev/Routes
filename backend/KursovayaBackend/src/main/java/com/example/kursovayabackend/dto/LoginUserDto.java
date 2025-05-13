package com.example.kursovayabackend.dto;

import lombok.Data;

@Data
public class LoginUserDto {
    private String email;
    private String password;
}