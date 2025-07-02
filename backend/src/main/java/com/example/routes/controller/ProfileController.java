package com.example.routes.controller;

import com.example.routes.dto.response.ProfileResponse;
import com.example.routes.service.ProfileService;
import com.example.routes.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class ProfileController {
    private final ProfileService profileService;

    @GetMapping("/{userId}/profile")
    public ResponseEntity<ProfileResponse> profileUser(@PathVariable Long userId) {
        return ResponseEntity.ok(profileService.getProfile(userId));

    }

}
