package com.example.kursovayabackend.dto;

import lombok.Data;

@Data
public class RegisterUserDto {
    private String email;
    private String password;
}