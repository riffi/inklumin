package ru.inklumin.inkluminapi.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
@Data
public class RegisterRequest {
  @NotBlank(message = "Username is required")
  @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
  private String username;



  @NotBlank(message = "Password is required")
  @Size(min = 6, message = "Password must be at least 6 characters long")
  private String password;

  @NotBlank(message = "Password confirmation is required")
  private String confirmPassword;
  private String displayName;

  // Constructors
  public RegisterRequest() {}

  public RegisterRequest(String username, String password, String displayName, String confirmPassword) {
    this.username = username;
    this.password = password;
    this.displayName = displayName;
    this.confirmPassword = confirmPassword;
  }

}
