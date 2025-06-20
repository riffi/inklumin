package ru.inklumin.inkluminapi.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import ru.inklumin.inkluminapi.dto.ApiResponse;
import ru.inklumin.inkluminapi.dto.BookResponse;
import ru.inklumin.inkluminapi.dto.BookShortInfo;
import ru.inklumin.inkluminapi.dto.SaveBookRequest;
import ru.inklumin.inkluminapi.service.BookService;

@RestController
@RequestMapping("/api/books")
public class BookController {
  private final BookService bookService;

  public BookController(BookService bookService) {
    this.bookService = bookService;
  }

  @PostMapping
  public ResponseEntity<?> saveBook(
      @Valid @RequestBody SaveBookRequest request,
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
      BookResponse response = bookService.saveBookData(userId, request);
      return ResponseEntity.ok(new ApiResponse(true, "Book saved successfully", response));
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest()
          .body(new ApiResponse(false, e.getMessage()));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ApiResponse(false, "Error saving book"));
    }
  }

  @GetMapping("/{uuid}")
  public ResponseEntity<?> getBook(
      @PathVariable String uuid,
      Authentication authentication
  ) {
    try {
      Long userId = (Long) authentication.getPrincipal();
      BookResponse response = bookService.getBookData(userId, uuid);
      return ResponseEntity.ok(new ApiResponse(true, "Book retrieved successfully", response));
    } catch (RuntimeException e) {
      if (e.getMessage().equals("Book not found")) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ApiResponse(false, "Book not found"));
      }
      return ResponseEntity.badRequest()
          .body(new ApiResponse(false, e.getMessage()));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ApiResponse(false, "Error retrieving book"));
    }
  }

  @GetMapping
  public ResponseEntity<?> getUserBooks(Authentication authentication) {
    try {
      Long userId = (Long) authentication.getPrincipal();
      List<BookShortInfo> books = bookService.getUserBooks(userId);
      return ResponseEntity.ok(new ApiResponse(true, "Books retrieved", books));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ApiResponse(false, "Error retrieving books"));
    }
  }
}
