package com.example.routes.service;

import com.example.routes.dto.response.ProfileResponse;
import com.example.routes.entity.User;
import com.example.routes.exception.ResourceNotFoundException;
import com.example.routes.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Long userId) {
        User user = getUserOrThrow(userId);
        return mapToDto(user);
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private ProfileResponse mapToDto(User user) {
        ProfileResponse profileDto = new ProfileResponse();
        profileDto.setUserId(user.getUserId());
        profileDto.setUsername(user.getUsername());
        profileDto.setEmail(user.getEmail());
        profileDto.setRoutesCount(user.getRoutesCount());
        profileDto.setTotalDistance(user.getTotalDistance());
        return profileDto;
    }
}