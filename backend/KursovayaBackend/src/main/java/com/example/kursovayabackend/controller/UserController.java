package com.example.kursovayabackend.controller;

import com.example.kursovayabackend.dto.AuthResponseDto;
import com.example.kursovayabackend.dto.LoginUserDto;
import com.example.kursovayabackend.dto.RegisterUserDto;
import com.example.kursovayabackend.dto.UserProfileDto;
import com.example.kursovayabackend.entity.UserEntity;
import com.example.kursovayabackend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterUserDto registerUserDto) {
        try {
            UserEntity user = new UserEntity();
            user.setEmail(registerUserDto.getEmail());
            user.setPassword(registerUserDto.getPassword());

            userService.registerUser(user);
            return ResponseEntity.ok("Registration successful");
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody LoginUserDto loginUserDto) {
        try {
            AuthResponseDto response = userService.loginUser(loginUserDto);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    new AuthResponseDto(null, null, null)
            );
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateToken(@RequestHeader("Authorization") String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            boolean isValid = userService.validateToken(token);
            return ResponseEntity.ok(isValid);
        } catch (Exception e) {
            return ResponseEntity.ok(false);
        }
    }

    @GetMapping("/users/{userId}/profile")
    public ResponseEntity<?> getUserProfile(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            UserProfileDto profile = userService.getUserProfile(userId);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}