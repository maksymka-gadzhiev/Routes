package com.example.routes.service;

import com.example.routes.dto.response.ProfileResponse;
import com.example.routes.entity.User;
import com.example.routes.exception.ResourceAlreadyExistsException;
import com.example.routes.exception.ResourceNotFoundException;
import com.example.routes.repository.UserRepository;
import com.example.routes.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return new UserDetailsImpl(user);
    }

    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already exists");
        }
        return userRepository.save(user);
    }

}
