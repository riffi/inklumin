package ru.inklumin.inkluminapi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ru.inklumin.inkluminapi.dto.LoginRequest;
import ru.inklumin.inkluminapi.dto.RegisterRequest;
import ru.inklumin.inkluminapi.entity.User;
import ru.inklumin.inkluminapi.repository.UserRepository;

@Service
public class UserService {

  private final UserRepository userRepository;

  private final PasswordEncoder passwordEncoder;

  public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  public User registerUser(RegisterRequest registerRequest) {
    if (userRepository.existsByUsername(registerRequest.getUsername())) {
      throw new RuntimeException("Имя пользователя уже занято");
    }

    if (!registerRequest.getPassword().equals(registerRequest.getConfirmPassword())) {
      throw new RuntimeException("Введенные пароли не совпадают");
    }

    User user = new User();
    user.setUsername(registerRequest.getUsername());
    user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
    user.setDisplayName(registerRequest.getDisplayName());

    return userRepository.save(user);
  }

  public User authenticateUser(LoginRequest loginRequest) {
    User user = userRepository.findByUsername(loginRequest.getUsername())
        .orElseThrow(() -> new RuntimeException("Неверное имя пользователя или пароль"));

    if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
      throw new RuntimeException("Неверное имя пользователя или пароль");
    }

    return user;
  }

  public User findByUsername(String username) {
    return userRepository.findByUsername(username)
        .orElseThrow(() -> new RuntimeException("User not found"));
  }
}
