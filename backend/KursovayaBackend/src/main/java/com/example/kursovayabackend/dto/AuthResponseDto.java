package com.example.kursovayabackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponseDto {
    @JsonProperty("token")
    private String token;

    @JsonProperty("userId")
    private Long userId;

    @JsonProperty("email")
    private String email;
}