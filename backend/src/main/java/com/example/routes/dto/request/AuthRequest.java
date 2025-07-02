package com.example.routes.dto.request;

import lombok.Data;

@Data
public class AuthRequest { // запрос на аутентификацию
    private String email;
    private String password;
}
