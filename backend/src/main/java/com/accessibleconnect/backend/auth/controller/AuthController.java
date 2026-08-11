package com.accessibleconnect.backend.auth.controller;

import com.accessibleconnect.backend.auth.dto.*;
import com.accessibleconnect.backend.auth.service.AuthService;
import com.accessibleconnect.backend.profile.dto.ProfileResponse;
import com.accessibleconnect.backend.profile.repository.AccessibilityProfileRepository;
import com.accessibleconnect.backend.user.entity.User;
import com.accessibleconnect.backend.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccessibilityProfileRepository profileRepository;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.register(
                request.getName(),
                request.getEmail(),
                request.getPassword(),
                request.getPhone(),
                request.getAccountType(),
                request.getAccessibilityNeeds(),
                request.getPreferredLanguage(),
                request.getPreferredSignLanguage(),
                request.getTextSizePreference(),
                request.isHighContrastPreference(),
                request.getCommunicationPreference()
        );
        UserResponse response = new UserResponse(
                user.getId(), 
                user.getName(), 
                user.getEmail(), 
                user.getPhone(), 
                user.getAccountType(), 
                user.isEnabled()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        String accessToken = authService.login(request.getEmail(), request.getPassword(), response);
        return ResponseEntity.ok(new JwtResponse(accessToken));
    }

    @PostMapping("/refresh")
    public ResponseEntity<JwtResponse> refresh(HttpServletRequest request, HttpServletResponse response) {
        String accessToken = authService.refresh(request, response);
        return ResponseEntity.ok(new JwtResponse(accessToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request, HttpServletResponse response) {
        authService.logout(request, response);
        Map<String, String> body = new HashMap<>();
        body.put("message", "Logged out successfully");
        return ResponseEntity.ok(body);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserResponse response = new UserResponse(
                user.getId(), 
                user.getName(), 
                user.getEmail(), 
                user.getPhone(), 
                user.getAccountType(), 
                user.isEnabled()
        );

        if (user.getAccountType() == com.accessibleconnect.backend.user.entity.AccountType.ACCESSIBILITY_USER) {
            profileRepository.findByUserId(user.getId()).ifPresent(profile -> {
                ProfileResponse profileResponse = new ProfileResponse(
                        profile.getPreferredLanguage(),
                        profile.getPreferredSignLanguage(),
                        profile.getTextSizePreference(),
                        profile.isHighContrastPreference(),
                        profile.getCommunicationPreference(),
                        profile.getNeeds().stream().map(n -> n.getNeedType()).collect(Collectors.toList())
                );
                response.setProfile(profileResponse);
            });
        }

        return ResponseEntity.ok(response);
    }
}
