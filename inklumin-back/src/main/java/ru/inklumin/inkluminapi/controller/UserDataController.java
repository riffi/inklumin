package ru.inklumin.inkluminapi.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.inklumin.inkluminapi.dto.ApiResponse;
import ru.inklumin.inkluminapi.dto.ConfigDataResponse;
import ru.inklumin.inkluminapi.dto.SaveConfigDataRequest;
import ru.inklumin.inkluminapi.service.UserConfigDataService;

@RestController
@RequestMapping("/api/user")
public class UserDataController {
  private final UserConfigDataService userConfigDataService;

  public UserDataController(UserConfigDataService userConfigDataService) {
    this.userConfigDataService = userConfigDataService;
  }

  @PostMapping("/config-data")
  public ResponseEntity<?> saveConfigData(
      @Valid @RequestBody SaveConfigDataRequest request,
      BindingResult bindingResult,
      Authentication authentication) { // Получаем аутентификацию из контекста

    if (bindingResult.hasErrors()) {
      return ResponseEntity.badRequest()
          .body(new ApiResponse(false, "Validation error: " +
              bindingResult.getFieldError().getDefaultMessage()));
    }

    try {
      Long userId = (Long) authentication.getPrincipal(); // Извлекаем userId из principal
      ConfigDataResponse response = userConfigDataService.saveConfigData(userId, request.getConfigData());
      return ResponseEntity.ok(new ApiResponse(true, "Config data saved successfully", response));
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest()
          .body(new ApiResponse(false, e.getMessage()));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ApiResponse(false, "An error occurred while saving config data"));
    }
  }

  @GetMapping("/config-data")
  public ResponseEntity<?> getConfigData(Authentication authentication) { // Получаем аутентификацию из контекста
    try {
      Long userId = (Long) authentication.getPrincipal(); // Извлекаем userId из principal
      ConfigDataResponse response = userConfigDataService.getConfigData(userId);
      return ResponseEntity.ok(new ApiResponse(true, "Config data retrieved successfully", response));
    } catch (RuntimeException e) {
      if (e.getMessage().equals("Config data not found for user")) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ApiResponse(false, "No config data found for user"));
      }
      return ResponseEntity.badRequest()
          .body(new ApiResponse(false, e.getMessage()));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ApiResponse(false, "An error occurred while retrieving config data"));
    }
  }
}
