package ru.inklumin.inkluminapi.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import ru.inklumin.inkluminapi.dto.ApiResponse;
import ru.inklumin.inkluminapi.dto.NotesDataResponse;
import ru.inklumin.inkluminapi.dto.SaveNotesDataRequest;
import ru.inklumin.inkluminapi.dto.NotesMetaResponse;
import ru.inklumin.inkluminapi.service.UserNotesDataService;

@RestController
@RequestMapping("/api/user")
public class NotesDataController {
  private final UserNotesDataService userNotesDataService;

  public NotesDataController(UserNotesDataService userNotesDataService) {
    this.userNotesDataService = userNotesDataService;
  }

  @PostMapping("/notes-data")
  public ResponseEntity<?> saveNotesData(
      @Valid @RequestBody SaveNotesDataRequest request,
      BindingResult bindingResult,
      Authentication authentication
  ) {
    if (bindingResult.hasErrors()) {
      return ResponseEntity.badRequest()
          .body(new ApiResponse(false, "Validation error: " +
              bindingResult.getFieldError().getDefaultMessage()));
    }

    try {
      Long userId = (Long) authentication.getPrincipal();
      NotesDataResponse response = userNotesDataService.saveNotesData(userId, request.getNotesData());
      return ResponseEntity.ok(new ApiResponse(true, "Notes data saved successfully", response));
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ApiResponse(false, "An error occurred while saving notes data"));
    }
  }

  @GetMapping("/notes-data")
  public ResponseEntity<?> getNotesData(Authentication authentication) {
    try {
      Long userId = (Long) authentication.getPrincipal();
      NotesDataResponse response = userNotesDataService.getNotesData(userId);
      return ResponseEntity.ok(new ApiResponse(true, "Notes data retrieved successfully", response));
    } catch (RuntimeException e) {
      if (e.getMessage().equals("Notes data not found for user")) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ApiResponse(false, "No notes data found for user"));
      }
      return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ApiResponse(false, "An error occurred while retrieving notes data"));
    }
  }

  @GetMapping("/notes-meta")
  public ResponseEntity<?> getNotesMeta(Authentication authentication) {
    try {
      Long userId = (Long) authentication.getPrincipal();
      String updatedAt = userNotesDataService.getNotesUpdatedAt(userId);
      NotesMetaResponse response = new NotesMetaResponse(updatedAt);
      return ResponseEntity.ok(new ApiResponse(true, "Notes meta retrieved", response));
    } catch (RuntimeException e) {
      if (e.getMessage().equals("Notes data not found for user")) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ApiResponse(false, "No notes data found for user"));
      }
      return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ApiResponse(false, "An error occurred while retrieving notes meta"));
    }
  }
}
