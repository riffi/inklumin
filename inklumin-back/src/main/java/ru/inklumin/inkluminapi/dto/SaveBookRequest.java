package ru.inklumin.inkluminapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SaveBookRequest {
  @NotBlank(message = "UUID is required")
  private String uuid;

  @NotBlank(message = "Book title is required")
  @Size(max = 255, message = "Title must be less than 255 characters")
  private String bookTitle; // Добавлено поле

  @NotBlank(message = "Book data is required")
  private String bookData;

  private String kind;
}
