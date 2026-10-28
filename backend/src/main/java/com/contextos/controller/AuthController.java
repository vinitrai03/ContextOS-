package com.contextos.controller;

import com.contextos.dto.JwtResponse;
import com.contextos.dto.LoginRequest;
import com.contextos.dto.SignupRequest;
import com.contextos.dto.TokenRefreshRequest;
import com.contextos.dto.TokenRefreshResponse;
import com.contextos.model.AuditLog;
import com.contextos.model.RefreshToken;
import com.contextos.model.Role;
import com.contextos.model.User;
import com.contextos.repository.AuditLogRepository;
import com.contextos.repository.UserRepository;
import com.contextos.security.JwtUtils;
import com.contextos.security.UserDetailsImpl;
import com.contextos.service.RefreshTokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.Map;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;
    private final AuditLogRepository auditLogRepository;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        user.setLastLoginAt(ZonedDateTime.now());
        userRepository.save(user);

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

        auditLogRepository.save(AuditLog.builder()
                .actor(user)
                .action("LOGIN")
                .ipAddress(request.getRemoteAddr())
                .build());

        return ResponseEntity.ok(JwtResponse.builder()
                .token(jwt)
                .refreshToken(refreshToken.getTokenHash())
                .id(userDetails.getId())
                .name(userDetails.getName())
                .email(userDetails.getEmail())
                .role(user.getRole().name())
                .type("Bearer")
                .build());
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest, HttpServletRequest request) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Email is already in use!"));
        }

        User user = User.builder()
                .name(signUpRequest.getName())
                .email(signUpRequest.getEmail())
                .passwordHash(encoder.encode(signUpRequest.getPassword()))
                .role(signUpRequest.getRole() != null ? signUpRequest.getRole() : Role.PARTICIPANT)
                .build();

        userRepository.save(user);

        auditLogRepository.save(AuditLog.builder()
                .actor(user)
                .action("REGISTER")
                .ipAddress(request.getRemoteAddr())
                .build());

        return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshtoken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtils.generateTokenFromUsername(user.getEmail());
                    return ResponseEntity.ok(new TokenRefreshResponse(token, requestRefreshToken, "Bearer"));
                })
                .orElseThrow(() -> new IllegalArgumentException("Refresh token is not in database!"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl userDetails) {
            UUID userId = userDetails.getId();
            refreshTokenService.deleteByUserId(userId);
            
            auditLogRepository.save(AuditLog.builder()
                    .actor(userRepository.findById(userId).orElse(null))
                    .action("LOGOUT")
                    .ipAddress(request.getRemoteAddr())
                    .build());
        }
        return ResponseEntity.ok(Map.of("message", "Log out successful!"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl userDetails) {
            User user = userRepository.findById(userDetails.getId()).orElseThrow();
            return ResponseEntity.ok(user); // Normally we'd use a DTO here
        }
        return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
    }
}
