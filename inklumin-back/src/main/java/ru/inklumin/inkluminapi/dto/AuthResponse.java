package ru.inklumin.inkluminapi.dto;

import lombok.Data;

@Data
public class AuthResponse {
  private String token;
  private String type = "Bearer";
  private String username;

  private String displayName;
  private Long userId;

  public AuthResponse(String token, String username, String displayName, Long userId) {
    this.token = token;
    this.username = username;
    this.userId = userId;
    this.displayName = displayName;
  }
}
