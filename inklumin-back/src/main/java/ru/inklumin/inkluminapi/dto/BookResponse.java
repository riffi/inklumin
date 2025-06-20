package ru.inklumin.inkluminapi.dto;

import lombok.Data;

@Data
public class BookResponse {
  private String uuid;
  private String bookTitle; // Добавлено поле
  private String bookData;
  private String createdAt;
  private String updatedAt;

  public BookResponse(String uuid, String bookTitle, String bookData, String createdAt, String updatedAt) {
    this.uuid = uuid;
    this.bookTitle = bookTitle;
    this.bookData = bookData;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
