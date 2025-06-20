package ru.inklumin.inkluminapi.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.inklumin.inkluminapi.dto.ApiResponse;
import ru.inklumin.inkluminapi.dto.AuthResponse;
import ru.inklumin.inkluminapi.dto.LoginRequest;
import ru.inklumin.inkluminapi.dto.RegisterRequest;
import ru.inklumin.inkluminapi.entity.User;
import ru.inklumin.inkluminapi.security.JwtUtil;
import ru.inklumin.inkluminapi.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final UserService userService;

  private final JwtUtil jwtUtil;

  public AuthController(UserService userService, JwtUtil jwtUtil) {
    this.userService = userService;
    this.jwtUtil = jwtUtil;
  }

  @PostMapping("/register")
  public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest,
      BindingResult bindingResult) {
    if (bindingResult.hasErrors()) {
      return ResponseEntity.badRequest()
          .body(new ApiResponse(false, "Validation error: " +
              bindingResult.getFieldError().getDefaultMessage()));
    }

    try {
      User user = userService.registerUser(registerRequest);
      String token = jwtUtil.generateToken(user.getUsername(), user.getId());

      AuthResponse authResponse = new AuthResponse(token, user.getUsername(), user.getDisplayName(),user.getId());
      return ResponseEntity.ok(new ApiResponse(true, "User registered successfully", authResponse));
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest()
          .body(new ApiResponse(false, e.getMessage()));
    }
  }

  @PostMapping("/login")
  public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest loginRequest,
      BindingResult bindingResult) {
    if (bindingResult.hasErrors()) {
      return ResponseEntity.badRequest()
          .body(new ApiResponse(false, "Validation error: " +
              bindingResult.getFieldError().getDefaultMessage()));
    }

    try {
      User user = userService.authenticateUser(loginRequest);
      String token = jwtUtil.generateToken(user.getUsername(), user.getId());

      AuthResponse authResponse = new AuthResponse(token, user.getUsername(), user.getDisplayName(), user.getId());
      return ResponseEntity.ok(new ApiResponse(true, "Login successful", authResponse));
    } catch (RuntimeException e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(new ApiResponse(false, e.getMessage()));
    }
  }

  @GetMapping("/validate")
  public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
    try {
      String token = authHeader.substring(7); // Remove "Bearer " prefix

      if (jwtUtil.validateToken(token)) {
        String username = jwtUtil.getUsernameFromToken(token);
        Long userId = jwtUtil.getUserIdFromToken(token);

        return ResponseEntity.ok(new ApiResponse(true, "Token is valid",
            new AuthResponse(token, username, "", userId)));
      } else {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new ApiResponse(false, "Invalid token"));
      }
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(new ApiResponse(false, "Invalid token"));
    }
  }

  @GetMapping("/healthcheck")
  public ResponseEntity<?> healthCheck() {
    return ResponseEntity.ok(new ApiResponse(true, "API is healthy"));
  }
}
