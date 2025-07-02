package com.example.routes.service;

import com.example.routes.dto.request.AuthRequest;
import com.example.routes.dto.request.UserRegisterRequest;
import com.example.routes.dto.response.AuthResponse;
import com.example.routes.entity.User;
import com.example.routes.exception.CustomAuthenticationException;
import com.example.routes.exception.ResourceAlreadyExistsException;
import com.example.routes.exception.ResourceNotFoundException;
import com.example.routes.repository.UserRepository;
import com.example.routes.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    public AuthResponse register(UserRegisterRequest userDto) {

        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new ResourceAlreadyExistsException("User with email " + userDto.getEmail() + " already exists");
        }

        User user = new User();
        user.setUsername(userDto.getUsername());
        user.setEmail(userDto.getEmail());
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));

        userService.createUser(user);

        UserDetails userDetails = new UserDetailsImpl(user);
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, userRepository.findByEmail(userDto.getEmail()).orElseThrow());
    }

    public AuthResponse login(AuthRequest request) {
        try {
            if (!userRepository.existsByEmail(request.getEmail())) {
                throw new ResourceNotFoundException("User with email " + request.getEmail() + " not found");
            }

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String token = jwtService.generateToken(userDetails);

            return new AuthResponse(token, userRepository.findByEmail(request.getEmail()).orElseThrow());
        } catch (BadCredentialsException exception) {
            throw new CustomAuthenticationException("Invalid password");
        } catch (AuthenticationException exception) {
            throw new CustomAuthenticationException("Authentication failed: " + exception.getMessage());
        }
     }


}
